import { cn } from "@/lib/utils";

export function Skeleton({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-shimmer rounded-[3px] bg-[length:200%_100%]",
        tone === "dark"
          ? "bg-[linear-gradient(90deg,rgb(242_234_219/0.04),rgb(242_234_219/0.1),rgb(242_234_219/0.04))]"
          : "bg-[linear-gradient(90deg,rgb(28_22_19/0.05),rgb(28_22_19/0.11),rgb(28_22_19/0.05))]",
        className,
      )}
    />
  );
}
