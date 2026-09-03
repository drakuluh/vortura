import { cn } from "@/lib/utils";

/**
 * Lightweight skeleton placeholders that mirror the rough shape of each
 * landing section. Used as Suspense fallbacks so lazy-loaded chunks don't
 * flash a blank gap while their JS arrives.
 */

const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-md bg-white/5 animate-pulse",
      className,
    )}
    aria-hidden="true"
  />
);

export const HeroSkeleton = () => (
  <section
    className="relative isolate min-h-[100svh] flex items-center justify-center pt-20 sm:pt-28 lg:pt-32 pb-10 sm:pb-16 lg:pb-20 overflow-hidden"
    aria-hidden="true"
  >
    <div className="container relative z-10">
      <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col items-center text-center">
        <Shimmer className="h-6 w-44 rounded-full mb-6 lg:mb-8" />
        <Shimmer className="h-10 sm:h-14 lg:h-20 w-[80%] mb-3" />
        <Shimmer className="h-10 sm:h-14 lg:h-20 w-[60%] mb-6 sm:mb-8" />
        <Shimmer className="h-3 w-[70%] mb-2" />
        <Shimmer className="h-3 w-[55%] mb-8 sm:mb-10" />
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-4">
          <Shimmer className="h-11 w-36 rounded-full" />
          <Shimmer className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>
  </section>
);

export const BentoServicesSkeleton = () => (
  <section
    id="services"
    className="relative py-12 md:py-14 lg:py-24"
    aria-hidden="true"
  >
    <div className="container relative z-10 flex flex-col items-center">
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto flex flex-col items-center">
        <div className="max-w-lg mx-auto text-center mb-7 md:mb-8 lg:mb-12 flex flex-col items-center">
          <Shimmer className="h-3 w-28 mb-3" />
          <Shimmer className="h-8 md:h-10 w-64 md:w-80 mb-2.5" />
          <Shimmer className="h-3 w-72" />
        </div>
        <div className="relative w-full flex items-center justify-center gap-4 md:gap-6">
          <Shimmer className="hidden md:block h-64 w-56 rounded-3xl opacity-60" />
          <Shimmer className="h-72 md:h-80 w-72 md:w-80 rounded-3xl" />
          <Shimmer className="hidden md:block h-64 w-56 rounded-3xl opacity-60" />
        </div>
      </div>
    </div>
  </section>
);

export const ContactFormSkeleton = () => (
  <section
    id="contact"
    className="relative py-10 md:py-14 lg:py-20"
    aria-hidden="true"
  >
    <div className="container relative z-10">
      <div className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
        <div className="text-center mb-5 md:mb-7 lg:mb-9 flex flex-col items-center">
          <Shimmer className="h-3 w-32 mb-3" />
          <Shimmer className="h-8 md:h-10 w-64 md:w-80 mb-2.5" />
          <Shimmer className="h-3 w-72" />
        </div>
        <div className="relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/10 bg-white/[0.04]">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Shimmer className="h-3 w-20 mb-1.5" />
                <Shimmer className="h-11 md:h-9 w-full" />
              </div>
              <div>
                <Shimmer className="h-3 w-20 mb-1.5" />
                <Shimmer className="h-11 md:h-9 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Shimmer className="h-3 w-20 mb-1.5" />
                <Shimmer className="h-11 md:h-9 w-full" />
              </div>
              <div>
                <Shimmer className="h-3 w-20 mb-1.5" />
                <Shimmer className="h-11 md:h-9 w-full" />
              </div>
            </div>
            <div>
              <Shimmer className="h-3 w-40 mb-1.5" />
              <Shimmer className="h-28 w-full" />
            </div>
            <Shimmer className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </section>
);