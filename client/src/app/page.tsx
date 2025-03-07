"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Ball from "@/components/ball";
import { restApi } from "@/app/api";

export default function Page() {
  const router = useRouter();

  const [question, setQuestion] = useState("");

  async function submit(formData: FormData) {
    const question = formData.get("question");
    await restApi.post("/question", {
      text: question,
    });
    router.push("/ask");
  }

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex flex-col gap-20 justify-items-center self-center">
        <h1 className="sr-only">Magic 8 Ball</h1>
        <div>
          <h2 className="text-5xl gap-3 font-pixel text-center text-balance text-purple-700">
            8Ball knows all
          </h2>
          <p className="text-2xl font-pixel text-center text-balance text-purple-700">
            Ask away
          </p>
        </div>

        <div className="flex flex-col gap-0.1">
          <Form
            className="flex flex-row max-w-[80vw] w-[40rem] self-center"
            action={submit}
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="placeholder-italic rounded-r-none font-mono"
              name="question"
              placeholder="Should I..."
            />
            <Button
              className="rounded-l-none"
              type="submit"
              disabled={question.length === 0}
            >
              Ask
            </Button>
          </Form>

          <Link
            className="italic text-[14px] mt-1 font-[450] text-purple-900 self-center w-[20rem]"
            href="/answer"
          >
            Answer someone's else's question instead
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center w-full">
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
