import * as assert from "node:assert";
import { DbAnswer } from "./entities/answer.js";
import { HttpError } from "./http_error.js";
import { answerSchema } from "./public_types/rest/answer.js";
import { Question, QuestionState } from "./public_types/rest/question.ts";
import { AppSocket } from "./public_types/socketio.js";
import { room } from "./types/socketio.js";

const PENDING_QUESTION_REUSE_DELAY = 15000;

const QuestionManager = new (class QuestionManager {
  private askerUnclaimedQueue = new Set<QuestionAskerSubscription>();
  private askerPendingQueue = new Set<QuestionAskerSubscription>();
  private questionToAsker = new Map<string, QuestionAskerSubscription>();

  private unassignedAnswerersQueue = new Set<QuestionAnswererSubscription>();

  subscribeAsAsker(socket: AppSocket, question: Question) {
    const subscription = new QuestionAskerSubscription(
      socket,
      (subscription) => {
        this.askerUnclaimedQueue.delete(subscription);
        this.askerPendingQueue.delete(subscription);
        this.questionToAsker.delete(question.id);
      },
      question,
    );
    this.askerUnclaimedQueue.add(subscription);
    this.questionToAsker.set(question.id, subscription);

    this.tryDequeue();
  }

  subscribeAsAnswerer(socket: AppSocket) {
    const subscription = new QuestionAnswererSubscription(
      socket,
      (subscription) => {
        this.unassignedAnswerersQueue.delete(subscription);

        // Handle if we are the only pending answerer
        if (subscription.asker?.answerers.size == 1) {
          // Move the asker back to the unclaimed queue
          this.askerPendingQueue.delete(subscription.asker);
          this.askerUnclaimedQueue.add(subscription.asker);

          // Let the asker know about what happened
          subscription.asker.socket.emit(
            "question:cancelled",
            subscription.asker.question,
          );
        }
      },
    );
    this.unassignedAnswerersQueue.add(subscription);

    this.tryDequeue();
  }

  answerQuestion(answer: DbAnswer) {
    const asker = this.questionToAsker.get(answer.question.id);

    // Silently ignore errors
    // Its possible to answer a question that isn't a question anymore if you were a secondary answerer
    // A malicious user can save to the db answers that aren't supposed to be answered by that user
    if (asker == null) return;

    let answerer: QuestionAnswererSubscription | null = null;
    for (const candidate of asker.answerers.values() ?? []) {
      if (candidate.socket.data.user_id === answer.author.id)
        answerer = candidate;
    }

    // Silently ignore errors for the same reason
    if (answerer == null) return;

    // Let the asker know we are answered them
    asker.socket.emit(
      "question:answered",
      asker.question,
      answerSchema.parse(answer),
    );

    // Clean up the asker (and the answerer subscriptions at the same time)
    asker.cleanup();
  }

  getQuestionState(question_id: string): QuestionState {
    const asker = this.questionToAsker.get(question_id);
    if (!asker) return QuestionState.Closed;
    if (asker.answerers.size > 0) return QuestionState.Pending;
    return QuestionState.Unclaimed;
  }

  private tryDequeue() {
    // Pair unclaimed questions
    for (const asker of this.askerUnclaimedQueue) {
      let answerer: QuestionAnswererSubscription | null = null;
      for (const candidate of this.unassignedAnswerersQueue) {
        // We never allow to answer your own question
        if (asker.socket.data.user_id == candidate.socket.data.user_id)
          continue;

        // Got a match!
        answerer = candidate;
        break;
      }

      // We couldn't find anyone for this asker, next!
      if (answerer == null) continue;

      // Move from unclaimed queue to pending queue
      this.askerUnclaimedQueue.delete(asker);
      this.askerPendingQueue.add(asker);

      // Remove the answerer
      this.unassignedAnswerersQueue.delete(answerer);

      // Emit events
      asker.socket.emit("question:pending", asker.question);
      answerer.socket.emit("answer:found_question", asker.question);

      // Connect asker to answerer
      answerer.connectToAsker(asker);
    }

    // Find something for the unassigned answerers to do
    for (const answerer of this.unassignedAnswerersQueue) {
      if (
        new Date().valueOf() - answerer.startedAt.valueOf() >
        PENDING_QUESTION_REUSE_DELAY
      ) {
        let asker: QuestionAskerSubscription | null = null;
        for (const candidate of this.askerPendingQueue) {
          // Don't allow responding to our own question
          if (candidate.socket.data.user_id === answerer.socket.data.user_id)
            continue;

          // We found an asker
          asker = candidate;
          break;
        }

        // We couldn't find anyone for this answerer, next!
        if (asker == null) continue;

        //do not do queue operations for asker

        // Remove the answerer
        this.unassignedAnswerersQueue.delete(answerer);

        // Emit events
        //do not emit pending event
        answerer.socket.emit("answer:found_question", asker.question);

        // Connect asker to answerer
        answerer.connectToAsker(asker);
      }
    }
  }
})();

abstract class QuestionSubscription<Self extends QuestionSubscription<Self>> {
  public readonly startedAt = new Date();

  constructor(
    public readonly socket: AppSocket,
    private cleanupFn: (self: Self) => void,
  ) {
    this.cleanup = this.cleanup.bind(this);

    socket.on("disconnecting", this.cleanup);
  }

  public cleanup() {
    this.cleanupFn(this as unknown as Self);
    this.socket.off("disconnecting", this.cleanup);
  }
}

class QuestionAskerSubscription extends QuestionSubscription<QuestionAskerSubscription> {
  public answerers = new Set<QuestionAnswererSubscription>();

  constructor(
    socket: AppSocket,
    disposeFn: (self: QuestionAskerSubscription) => void,
    public readonly question: Question,
  ) {
    super(socket, disposeFn);

    socket.join([room.question(question.id), room.question_asker(question.id)]);
  }

  public cleanup() {
    super.cleanup();

    this.socket.leave(room.question(this.question.id));
    this.socket.leave(room.question_asker(this.question.id));

    // We destroy all our answerers because they're no longer useful
    this.answerers.forEach((x) => x.cleanup());
  }
}

class QuestionAnswererSubscription extends QuestionSubscription<QuestionAnswererSubscription> {
  public asker?: QuestionAskerSubscription;

  connectToAsker(asker: QuestionAskerSubscription) {
    assert.ok(this.asker == null);
    this.asker = asker;
    asker.answerers.add(this);
  }

  public cleanup() {
    super.cleanup();

    this.asker?.answerers.delete(this);
  }
}

export default QuestionManager;
