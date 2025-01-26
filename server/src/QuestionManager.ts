import * as assert from "node:assert";
import { Question, QuestionState } from "./public_types/question.ts";
import { AppSocket } from "./realtime.ts";

const QuestionManager = new (class QuestionManager {
  private askerQueue = new Set<QuestionAskerSubscription>();
  private askerPendingQueue = new Set<QuestionAskerSubscription>();
  private answererQueue = new Set<QuestionAnswererSubscription>();

  private questionToAsker = new Map<string, QuestionAskerSubscription>();

  subscribeAsAsker(socket: AppSocket, question: Question) {
    const subscription = new QuestionAskerSubscription(
      socket,
      (subscription) => {
        this.askerQueue.delete(subscription);
        this.askerPendingQueue.delete(subscription);
        this.questionToAsker.delete(question.id);
      },
      question,
    );
    this.askerQueue.add(subscription);
    this.questionToAsker.set(question.id, subscription);

    this.tryDequeue();
  }

  subscribeAsAnswerer(socket: AppSocket) {
    const subscription = new QuestionAnswererSubscription(
      socket,
      (subscription) => {
        this.answererQueue.delete(subscription);
      },
    );
    this.answererQueue.add(subscription);

    this.tryDequeue();
  }

  getQuestionState(question_id: string): QuestionState {
    const asker = this.questionToAsker.get(question_id);
    if (!asker) return QuestionState.Closed;
    if (asker.answerers.size > 0) return QuestionState.Pending;
    return QuestionState.Unclaimed;
  }

  private tryDequeue() {
    // Pair 1:1 asker and answerer
    const optimalPairings = Math.min(
      this.askerQueue.size,
      this.answererQueue.size,
    );

    for (let i = 0; i < optimalPairings; i++) {
      const asker = this.askerQueue.values().next().value!;
      const answerer = this.answererQueue.values().next().value!;

      this.askerQueue.delete(asker);
      this.answererQueue.delete(answerer);

      asker.socket.emit("question:pending", asker.question);
      this.askerPendingQueue.add(asker);

      answerer.socket.emit("answer:found_question", asker.question);
    }
  }
})();

abstract class QuestionSubscription<Self extends QuestionSubscription<Self>> {
  constructor(
    public readonly socket: AppSocket,
    private disposeFn: (self: Self) => void,
  ) {
    this.dispose = this.dispose.bind(this);

    socket.on("disconnect", this.dispose);
  }

  protected dispose() {
    this.socket.off("disconnect", this.dispose);
    this.disposeFn(this as unknown as Self);
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
  }

  protected dispose() {
    super.dispose();

    this.answerers.forEach((x) => (x.asker = undefined));
  }
}

class QuestionAnswererSubscription extends QuestionSubscription<QuestionAnswererSubscription> {
  public asker?: QuestionAskerSubscription;

  connectToAsker(asker: QuestionAskerSubscription) {
    assert.ok(this.asker == null);
    this.asker = asker;
    asker.answerers.add(this);
  }

  protected dispose() {
    super.dispose();

    this.asker?.answerers.delete(this);
  }
}

export default QuestionManager;
