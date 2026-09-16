import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-medium",
    "transition-[background-color,color,border-color,opacity,filter] duration-200 ease-[var(--ease-kalaverse)]",
    "disabled:pointer-events-none disabled:opacity-40 active:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        ivory: "bg-ivory text-night hover:bg-paper",
        gold: "bg-gold text-night hover:bg-gold-light",
        outline: "border border-ivory/25 text-ivory hover:border-ivory/60 hover:bg-ivory/[0.05]",
        ghost: "text-ivory-dim hover:bg-ivory/[0.07] hover:text-ivory",
        ink: "bg-ink text-paper hover:bg-night-3",
        "outline-ink": "border border-ink/20 text-ink hover:border-ink/55 hover:bg-ink/[0.04]",
        "ghost-ink": "text-ink-soft hover:bg-ink/[0.06] hover:text-ink",
        open: "bg-open text-night hover:brightness-110",
        guided: "bg-guided text-night hover:brightness-110",
        protected: "bg-protected text-ivory hover:brightness-110",
        indigo: "bg-indigo-2 text-ivory hover:brightness-110",
      },
      size: {
        sm: "h-9 rounded-[3px] px-3.5 text-[0.8125rem]",
        md: "h-11 rounded-[3px] px-5 text-sm",
        lg: "h-14 rounded-[3px] px-7 text-[0.95rem]",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
      },
      caps: {
        true: "font-semibold uppercase tracking-[0.16em] [font-stretch:90%]",
        false: "",
      },
    },
    compoundVariants: [
      { caps: true, size: "sm", className: "text-[0.68rem]" },
      { caps: true, size: "md", className: "text-[0.72rem]" },
      { caps: true, size: "lg", className: "text-[0.78rem]" },
    ],
    defaultVariants: { variant: "ivory", size: "md", caps: false },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, caps, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, caps }), className)} {...props} />;
}
