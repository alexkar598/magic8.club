"use client";
import Image from "next/image";
import ballImage from "@/images/placeholder-ball.png";
import { Textarea } from "@/components/ui/textarea";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  async function submit(formData: FormData) {}
  const [question, setQuestion] = useState("");

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex text-2xl self-center items-center gap-5 flex-col font-mono ">
        <h1>Should I shave my eyebrows?</h1>
        <Form
          className="flex w-[40rem] self-center flex-col gap-2"
          action={submit}
        >
          <Textarea
            className="placeholder-italic resize-none w-[40rem]"
            placeholder="Type your answer here..."
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={280}
          />
          <div className="flex justify-end ">
            <Button type="submit" disabled={question.length === 0}>
              {" "}
              Submit{" "}
            </Button>
          </div>
        </Form>
      </div>
      <div className="flex flex-col  gap-8 items-center">
        <Image src={ballImage} alt="Magic 8 Ball" width={640} />
      </div>
    </main>
  );
}
