"use client";

import { useRive } from "@rive-app/react-canvas";
import { useEffect, useRef } from "react";

export default function Ball() {
  const { rive, RiveComponent } = useRive({
    src: "/assets/rive/ball.riv",
    animations: ["x_axis", "y_ordinate"],
    autoplay: false,
  });

  const mousePos = useRef({ x: 0, y: 0 });

  const riveRef = useRef<HTMLDivElement>(null);

  function render() {
    if (!riveRef.current) return;
    if (rive == null) {
      requestAnimationFrame(render);
      return;
    }

    const rect = riveRef.current.getBoundingClientRect();
    const middleX = rect.x + rect.width / 2;
    const middleY = rect.y + rect.height / 2;

    const xOffset = mousePos.current.x - middleX;
    const yOffset = mousePos.current.y - middleY;

    rive.scrub("x_axis", 0.5 + xOffset / rect.width);
    rive.scrub("y_ordinate", 0.5 + yOffset / rect.height);
    requestAnimationFrame(render);
  }

  function updateMousePos(event: MouseEvent) {
    mousePos.current = { x: event.clientX, y: event.clientY };
  }

  useEffect(() => {
    document.addEventListener("mousemove", updateMousePos);
    requestAnimationFrame(render);

    return () => {
      document.removeEventListener("mousemove", updateMousePos);
    };
  });

  return (
    <div ref={riveRef} className="max-w-[95vw] w-[32rem] h-[32rem] m-auto">
      <RiveComponent className="w-full h-full" />
    </div>
  );
}
