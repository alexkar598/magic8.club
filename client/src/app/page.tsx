"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Ball from "@/components/ball";
import { restApi } from "@/app/api";

export default function Page() {
  const router = useRouter();

  const [question, setQuestion] = useState("");

  async function submit(formData: FormData) {
    const question = formData.get("question");
    const reponse = await restApi.post("/question", {
      text: question,
    });
    const id = reponse.data.id;
    router.push(`/ask/${id}`);
  }

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex flex-col gap-20 justify-items-center self-center">
        <h1 className="sr-only">Magic 8 Ball</h1>
        <h2 className="text-5xl gap-3 font-mono">
          What do you want to ask the 8ball?
        </h2>
        <div className="flex flex-col gap-0.1">
          <Form className="flex flex-row w-[40rem] self-center" action={submit}>
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
              Submit
            </Button>
          </Form>

          <Link
            className="italic text-[14px] font-[450] text-purple-900 self-center w-[20rem]"
            href="/answer"
          >
            Answer someone's else's question instead
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center w-full">
        <Ball />
      </div>
    </main>
  );
}
