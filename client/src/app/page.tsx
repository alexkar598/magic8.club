"use client";

import Image from "next/image";
import ballImage from "@/images/placeholder-ball.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();

  const [question, setQuestion] = useState("");

  async function submit(formData: FormData) {
    const question = formData.get("question");
    await fetch("https://webhook.site/0daffc67-36c2-43c1-96f3-183f24cd104f", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    const id = "5435";
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
              className="placeholder-italic "
              name="question"
              placeholder="Should I..."
            />
            <Button type="submit" disabled={question.length === 0}>
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

      <div className="flex flex-col gap-8 items-center">
        <Image src={ballImage} alt="Magic 8 Ball" width={640} />
      </div>
    </main>
  );
}
