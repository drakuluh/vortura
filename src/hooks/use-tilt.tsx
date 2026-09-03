import { useRef, useCallback } from "react";
import { useIsMobile } from "./use-mobile";

export const useTilt = (maxDeg = 12) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      ref.current.style.transform = `perspective(600px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) scale3d(1.04, 1.04, 1.04)`;
    },
    [isMobile, maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave, style: { transition: "transform 0.2s ease-out", willChange: "transform" } as React.CSSProperties };
};

export const TiltCard = ({
  children,
  className = "",
  maxDeg = 12,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { maxDeg?: number }) => {
  const { ref, onMouseMove, onMouseLeave, style } = useTilt(maxDeg);
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ ...style, ...rest.style }}
      {...rest}
    >
      {children}
    </div>
  );
};

const floatKeyframes = `
@keyframes float-orbit {
  0%    { transform: perspective(800px) rotateX(0deg)    rotateY(3deg)    translateY(-4px); }
  12.5% { transform: perspective(800px) rotateX(-1.5deg) rotateY(2.1deg)  translateY(-2.8px); }
  25%   { transform: perspective(800px) rotateX(-2.1deg) rotateY(0deg)    translateY(0px); }
  37.5% { transform: perspective(800px) rotateX(-1.5deg) rotateY(-2.1deg) translateY(2.8px); }
  50%   { transform: perspective(800px) rotateX(0deg)    rotateY(-3deg)   translateY(4px); }
  62.5% { transform: perspective(800px) rotateX(1.5deg)  rotateY(-2.1deg) translateY(2.8px); }
  75%   { transform: perspective(800px) rotateX(2.1deg)  rotateY(0deg)    translateY(0px); }
  87.5% { transform: perspective(800px) rotateX(1.5deg)  rotateY(2.1deg)  translateY(-2.8px); }
  100%  { transform: perspective(800px) rotateX(0deg)    rotateY(3deg)    translateY(-4px); }
}
`;

let styleInjected = false;
const injectStyle = () => {
  if (styleInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = floatKeyframes;
  document.head.appendChild(s);
  styleInjected = true;
};

export const FloatCard = ({
  children,
  className = "",
  duration = 6,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { duration?: number }) => {
  injectStyle();
  return (
    <div
      className={className}
      style={{
        animation: `float-orbit ${duration}s linear infinite`,
        willChange: "transform",
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
