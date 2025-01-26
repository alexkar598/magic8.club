"use client";

import { useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";
import { socket } from "@/app/api";
import Ball from "@/components/ball";
import { Loader2 } from "lucide-react";

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

  const [quote, setQuote] = useState(quotes[0]);
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

  useInterval(() => {
    let index = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[index]);
  }, 5000);

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex flex-col gap-12 mt-[-2rem] items-center">
        {!answer && (
          <div className="flex flex-col gap-2 items-center">
            {isPending ? (
              <h2 className="text-3xl">Someone is answering...</h2>
            ) : (
              <h2 className="text-3xl">Waiting for a random user...</h2>
            )}
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        )}
        {useMemo(
          () => (
            <Ball />
          ),
          [],
        )}
        <h2>{answer}</h2>
        <p className="text-xl">“{quote}”</p>
        {isPending && <p>Someone's answering your question!</p>}
      </div>
    </main>
  );
}
