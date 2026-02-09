"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({
  expandedItems: new Set(),
  toggleItem: () => {},
  type: "single",
});

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      defaultValue,
      collapsible = false,
      children,
      ...props
    },
    ref
  ) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
      () => {
        if (!defaultValue) return new Set();
        if (Array.isArray(defaultValue)) return new Set(defaultValue);
        return new Set([defaultValue]);
      }
    );

    const toggleItem = React.useCallback(
      (value: string) => {
        setExpandedItems((prev) => {
          const next = new Set(prev);
          if (next.has(value)) {
            if (type === "single" && !collapsible) return next;
            next.delete(value);
          } else {
            if (type === "single") {
              next.clear();
            }
            next.add(value);
          }
          return next;
        });
      },
      [type, collapsible]
    );

    return (
      <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

const AccordionItemContext = React.createContext<{ value: string }>({
  value: "",
});

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        ref={ref}
        className={cn("border-b", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { expandedItems, toggleItem } = React.useContext(AccordionContext);
  const { value } = React.useContext(AccordionItemContext);
  const isExpanded = expandedItems.has(value);

  return (
    <h3 className="flex">
      <button
        ref={ref}
        type="button"
        aria-expanded={isExpanded}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180",
          className
        )}
        onClick={() => toggleItem(value)}
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </h3>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { expandedItems } = React.useContext(AccordionContext);
  const { value } = React.useContext(AccordionItemContext);
  const isExpanded = expandedItems.has(value);

  return (
    <div
      ref={ref}
      role="region"
      className={cn(
        "overflow-hidden text-sm",
        isExpanded ? "animate-accordion-down" : "hidden",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
