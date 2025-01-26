"use client";

import Image from "next/image";
import ballImage from "@/images/placeholder-ball.png";
import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { socket } from "@/app/api";

export default function Page() {
  const quotes = [
    "Patience is a virtue ",
    "Rome wasn't built in a day ",
    "We must learn to walk before we can run ",
    "Patience is bitter, but its fruit is sweet.",
    "He that can have patience can have what he will",
    "A man who is a master of patience is master of everything else.",
    "To lose patience is to lose the battle.",
    "Waiting is one of life’s hardships.",
    "Time brings everything, to those who can wait for it.",
    "All things come to those who wait.",
    "He who waits shall live to see.",
    "A life of almost, is a life of never",
    "Those who can’t dance blame the floor. ",
    "The deadliest poison is overconfidence. ",
    "Failure is only the opportunity to begin again.",
    "Fortune favors the prepared over the bold. ",
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
    const index = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[index]);
  }, 5000);

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex flex-col gap-20 mt-[-12rem] items-center ">
        <Image src={ballImage} alt="Magic 8 Ball" width={420} />
        <h2>{answer}</h2>
        <p>{quote}</p>
        {isPending && <p>Someone's answering your question!</p>}
      </div>
    </main>
  );
}
