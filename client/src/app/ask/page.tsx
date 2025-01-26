"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "@/app/api";
import Ball from "@/components/ball";
import { Loader2 } from "lucide-react";
import { TypeAnimation } from "react-type-animation";

export default function Page() {
  const quotes = [
    "Patience is a virtue",
    "Rome wasn't built in a day",
    "We must learn to walk before we can run",
    "Patience is bitter, but its fruit is sweet.",
    "He that can have patience can have what he will",
    "A man who is a master of patience is master of everything else.",
    "To lose patience is to lose the battle.",
    "Waiting is one of life’s hardships.",
    "Time brings everything, to those who can wait for it.",
    "All things come to those who wait.",
    "He who waits shall live to see.",
    "A life of almost, is a life of never",
    "Those who can’t dance blame the floor.",
    "The deadliest poison is overconfidence.",
    "Failure is only the opportunity to begin again.",
    "Fortune favors the prepared over the bold.",
  ];

  const quoteSequence = quotes.flatMap((q) => [q, 4000]);

  const [answer, setAnswer] = useState("");
  const [isPending, setIsPending] = useState(false);

  function pending() {
    setIsPending(true);
  }

  function cancelled() {
    setIsPending(false);
  }

  function answered(question: any, answer: any) {
    setAnswer(answer.text);
  }

  useEffect(() => {
    socket.on("question:pending", pending);
    socket.on("question:cancelled", cancelled);
    socket.once("question:answered", answered);

    return () => {
      socket.off("question:pending");
      socket.off("question:cancelled");
      socket.off("question:answered");
    };
  });

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex flex-col gap-6 mt-[-2rem] text-center items-centerfont-pixel text-purple-800 ">
        <div className="flex flex-col gap-2 items-center font-pixel">
          {answer ? (
            <TypeAnimation
              sequence={["The 8 ball has spoken!"]}
              cursor={false}
              className="text-2xl font-pixel"
            />
          ) : (
            <>
              {isPending ? (
                <h2 className="text-3xl">Someone is answering</h2>
              ) : (
                <h2 className="text-3xl">Waiting for a random user</h2>
              )}
              <Loader2 className="animate-spin w-12 h-12" />
            </>
          )}
        </div>

        {useMemo(
          () => (
            <Ball />
          ),
          [],
        )}
        {answer ? (
          <>
            <TypeAnimation
              sequence={[answer]}
              cursor={false}
              className="font-inherit text-left bg-gray-200 border rounded-xl px-4 py-2 text-xl font-pixel"
            />
          </>
        ) : (
          <span className="text-xl text-center text-purple-800  font-pixel">
            "<TypeAnimation sequence={quoteSequence} />"
          </span>
        )}
      </div>
    </main>
  );
}
