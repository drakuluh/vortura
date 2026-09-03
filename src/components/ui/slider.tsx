import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    /** Human-readable value announced by screen readers (e.g. "$400 per customer"). */
    "aria-valuetext"?: string;
  }
>(
  (
    {
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-valuetext": ariaValueText,
      ...props
    },
    ref,
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-foreground/20">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-primary" />
      </SliderPrimitive.Track>
      {/* Forward labels to the thumb (role="slider") so assistive tech announces
          what the control adjusts and a readable current value, not a bare number. */}
      <SliderPrimitive.Thumb
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-valuetext={ariaValueText}
        className="block h-6 w-6 md:h-5 md:w-5 rounded-full border-2 border-primary bg-background shadow-glow-blue ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  ),
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
