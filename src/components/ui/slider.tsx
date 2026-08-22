"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "../../lib/utils";

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn("w-full", className)} {...props}>
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="flex w-full items-center py-1.5"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="h-1.5 w-full rounded-full bg-muted select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="rounded-full bg-foreground select-none"
          />
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="size-4 rounded-full bg-background ring-1 ring-foreground/25 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
