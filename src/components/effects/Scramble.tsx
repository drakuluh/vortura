import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div" | "p";
  speed?: number;
  once?: boolean;
};

/**
 * Scramble / decrypt text reveal. Triggers when scrolled into view.
 */
export const Scramble = ({
  text,
  className = "",
  as = "span",
  speed = 1,
  once = true,
}: Props) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as any, { once, margin: "-15%" });
  const isMobile = useIsMobile();
  const [display, setDisplay] = useState(isMobile ? text : text.replace(/[^ ]/g, "\u00A0"));
  const Tag = as as any;

  useEffect(() => {
    if (isMobile) {
      setDisplay(text);
      return;
    }
    if (!inView) return;
    let frame = 0;
    const queue = text.split("").map((char, i) => ({
      from: CHARS[Math.floor(Math.random() * CHARS.length)],
      to: char,
      start: Math.floor(Math.random() * 20) + i,
      end: Math.floor(Math.random() * 30) + i + 20,
      char: "",
    }));
    let raf: number;
    let last = performance.now();
    const update = (now: number) => {
      // Throttle frame increment by speed
      if (now - last >= 16 / speed) {
        frame++;
        last = now;
      }
      let output = "";
      let complete = 0;
      for (const q of queue) {
        if (frame >= q.end) {
          complete++;
          output += q.to;
        } else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.28) {
            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          output += q.char;
        } else {
          output += q.from;
        }
      }
      setDisplay(output);
      if (complete < queue.length) {
        raf = requestAnimationFrame(update);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, isMobile, speed]);

  return (
    <Tag ref={ref as any} className={className}>
      {display}
    </Tag>
  );
};