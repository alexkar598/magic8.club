"use client";
import { Textarea } from "@/components/ui/textarea";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { restApi, socket } from "@/app/api";
import Ball from "@/components/ball";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  async function submit(formData: FormData) {
    setSubmitting(true);
    const text = formData.get("answer");
    await restApi.post("/answer_question/answer", {
      text,
      question: question.id,
    });
    setSubmitting(false);

    toast.success("Answer has been sent successfully !", {
      description: "Thank you for your answer!",
    });

    router.push("/");
  }

  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");

  function receivedQuestion(receivedQuestion: any) {
    setQuestion(receivedQuestion);
  }

  useEffect(() => {
    socket.once("answer:found_question", receivedQuestion);

    void restApi.post("/answer_question/search");
  }, []);

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex text-2xl self-center items-center gap-5 flex-col font-mono ">
        {question ? (
          <>
            <h1 className="font-pixel text-purple-700">{question.text}</h1>
            <Form
              className="flex w-[40rem] self-center flex-col gap-2"
              action={submit}
            >
              <Textarea
                name="answer"
                className="placeholder-italic resize-none w-[40rem]"
                placeholder="Type your answer here..."
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={280}
              />
              <div className="flex justify-end ">
                <Button
                  type="submit"
                  disabled={answer.length === 0 || submitting}
                >
                  {submitting && <Loader2 className="animation-spin" />}
                  Submit
                </Button>
              </div>
            </Form>
          </>
        ) : (
          <>
            <h1 className="font-pixel text-center text-purple-700">
              No questions for now...
            </h1>
            <Loader2 className="animate-spin text-purple-700 w-12 h-12" />
          </>
        )}
      </div>

      <div className="flex flex-col  gap-8 items-center w-full">
        {useMemo(
          () => (
            <Ball />
          ),
          [],
        )}
      </div>
    </main>
  );
}
