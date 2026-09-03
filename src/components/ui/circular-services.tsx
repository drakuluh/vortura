"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Service } from "@/data/services";
import { ServiceCard } from "@/components/landing/ServiceCard";

interface CircularServicesProps {
  services: Service[];
  autoplay?: boolean;
}

export const CircularServices: React.FC<CircularServicesProps> = ({
  services,
  autoplay = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = services.length;

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    intervalRef.current = setInterval(() => {
      setTransitionDirection(1);
      setActiveIndex((p) => (p + 1) % len);
    }, 5000);
    return stopAutoplay;
  }, [autoplay, len]);

  const next = useCallback(() => {
    stopAutoplay();
    setTransitionDirection(1);
    setActiveIndex((p) => (p + 1) % len);
  }, [len]);
  const prev = useCallback(() => {
    stopAutoplay();
    setTransitionDirection(-1);
    setActiveIndex((p) => (p - 1 + len) % len);
  }, [len]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) prev();
    else if (dx < -40) next();
    touchStartX.current = null;
  };

  const activeService = services[activeIndex];

  return (
    <div className="relative w-full mx-auto flex flex-col items-center">
      <div
        data-service-carousel-stage
        className="relative mx-auto w-full max-w-7xl"
        style={{ WebkitMaskImage: "none", maskImage: "none" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative mx-auto w-full h-[18rem] overflow-visible"
          style={{ WebkitMaskImage: "none", maskImage: "none" }}
        >
          <div
            className="absolute inset-0 overflow-visible"
            style={{ WebkitMaskImage: "none", maskImage: "none" }}
          >
            <AnimatePresence initial={false} mode="wait" custom={transitionDirection}>
              <motion.div
                key={activeService.slug}
                custom={transitionDirection}
                className="absolute top-0 h-full w-[22rem] sm:w-[24rem] left-1/2"
                style={{ marginLeft: "-11rem", WebkitMaskImage: "none", maskImage: "none" }}
                variants={{
                  enter: (dir: 1 | -1) => ({ x: dir * 120, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: 1 | -1) => ({ x: dir * -120, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full">
                  <ServiceCard service={activeService} animate={false} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            aria-label="Previous service"
            className="btn-hero-glass absolute left-1/2 -ml-[12.5rem] sm:-ml-[13.5rem] top-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white z-10 -translate-y-1/2 -translate-x-full"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={next}
            aria-label="Next service"
            className="btn-hero-glass absolute left-1/2 ml-[12.5rem] sm:ml-[13.5rem] top-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white z-10 -translate-y-1/2"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <ServiceDock
        services={services}
        activeIndex={activeIndex}
        onSelect={(i) => {
          stopAutoplay();
          const forwardDistance = (i - activeIndex + len) % len;
          const backwardDistance = (activeIndex - i + len) % len;
          setTransitionDirection(forwardDistance <= backwardDistance ? 1 : -1);
          setActiveIndex(i);
        }}
      />
    </div>
  );
};

export default CircularServices;

// Dock-style icon selector with macOS cosine magnification on hover.
// Keeps existing glass styling and lucide icons.
const BASE_SIZE = 40;
const SPACING = 8;
const MAX_SCALE = 1.8;
const MIN_SCALE = 1;
const EFFECT_WIDTH = 220;

interface ServiceDockProps {
  services: Service[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

const ServiceDock: React.FC<ServiceDockProps> = ({ services, activeIndex, onSelect }) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [scales, setScales] = useState<number[]>(() => services.map(() => MIN_SCALE));
  const [positions, setPositions] = useState<number[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const lastMove = useRef(0);

  const targetScales = useCallback(
    (mx: number | null) => {
      if (mx === null) return services.map(() => MIN_SCALE);
      return services.map((_, i) => {
        const center = i * (BASE_SIZE + SPACING) + BASE_SIZE / 2;
        const minX = mx - EFFECT_WIDTH / 2;
        const maxX = mx + EFFECT_WIDTH / 2;
        if (center < minX || center > maxX) return MIN_SCALE;
        const theta = ((center - minX) / EFFECT_WIDTH) * 2 * Math.PI;
        const factor = (1 - Math.cos(theta)) / 2;
        return MIN_SCALE + factor * (MAX_SCALE - MIN_SCALE);
      });
    },
    [services]
  );

  const computePositions = useCallback((s: number[]) => {
    let x = 0;
    return s.map((scale) => {
      const w = BASE_SIZE * scale;
      const cx = x + w / 2;
      x += w + SPACING;
      return cx;
    });
  }, []);

  useEffect(() => {
    setPositions(computePositions(services.map(() => MIN_SCALE)));
  }, [services, computePositions]);

  useEffect(() => {
    const tick = () => {
      const tS = targetScales(mouseX);
      const tP = computePositions(tS);
      const lerp = mouseX !== null ? 0.2 : 0.12;
      setScales((prev) => prev.map((c, i) => c + (tS[i] - c) * lerp));
      setPositions((prev) =>
        prev.length === tP.length ? prev.map((c, i) => c + (tP[i] - c) * lerp) : tP
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mouseX, targetScales, computePositions]);

  const handleMove = (e: React.MouseEvent) => {
    const now = performance.now();
    if (now - lastMove.current < 16) return;
    lastMove.current = now;
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX - rect.left - 8);
    }
  };

  const contentWidth =
    positions.length > 0
      ? Math.max(...positions.map((p, i) => p + (BASE_SIZE * scales[i]) / 2))
      : services.length * (BASE_SIZE + SPACING) - SPACING;

  return (
    <div
      ref={dockRef}
      className="mt-5 px-2"
      style={{ width: `${contentWidth + 16}px` }}
      onMouseMove={handleMove}
      onMouseLeave={() => setMouseX(null)}
      role="tablist"
      aria-label="Services"
    >
      <div className="relative" style={{ height: `${BASE_SIZE * MAX_SCALE}px`, width: "100%" }}>
        {services.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === activeIndex;
          const scale = scales[i] ?? MIN_SCALE;
          const pos = positions[i] ?? 0;
          const size = BASE_SIZE * scale;
          return (
            <button
              key={s.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={s.title}
              title={s.title}
              onClick={() => onSelect(i)}
              className={`glass absolute rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? "border-primary/40 text-primary shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                left: `${pos - size / 2}px`,
                bottom: 0,
                width: `${size}px`,
                height: `${size}px`,
                transformOrigin: "bottom center",
                zIndex: Math.round(scale * 10),
              }}
            >
              <Icon style={{ width: `${size * 0.4}px`, height: `${size * 0.4}px` }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
