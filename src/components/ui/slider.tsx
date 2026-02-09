"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = [0],
      onValueChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value =
      controlledValue !== undefined ? controlledValue : internalValue;
    const trackRef = React.useRef<HTMLDivElement>(null);

    const currentValue = value[0] ?? min;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    const updateValue = React.useCallback(
      (clientX: number) => {
        if (disabled || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.max(
          0,
          Math.min(1, (clientX - rect.left) / rect.width)
        );
        const rawValue = min + percent * (max - min);
        const steppedValue =
          Math.round(rawValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));
        const newValue = [clampedValue];

        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [min, max, step, disabled, controlledValue, onValueChange]
    );

    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        updateValue(e.clientX);

        const handlePointerMove = (moveEvent: PointerEvent) => {
          updateValue(moveEvent.clientX);
        };

        const handlePointerUp = () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp);
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
      },
      [disabled, updateValue]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          ref={trackRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20 cursor-pointer"
          onPointerDown={handlePointerDown}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          tabIndex={disabled ? -1 : 0}
          className="absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
          style={{
            left: `calc(${percentage}% - 8px)`,
          }}
          onPointerDown={handlePointerDown}
          onKeyDown={(e) => {
            if (disabled) return;
            let newVal = currentValue;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              newVal = Math.min(max, currentValue + step);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              newVal = Math.max(min, currentValue - step);
            } else if (e.key === "Home") {
              newVal = min;
            } else if (e.key === "End") {
              newVal = max;
            } else {
              return;
            }
            e.preventDefault();
            const updated = [newVal];
            if (controlledValue === undefined) {
              setInternalValue(updated);
            }
            onValueChange?.(updated);
          }}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
