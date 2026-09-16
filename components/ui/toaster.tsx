"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUI, type ToastTone } from "@/store/ui";
import { cn } from "@/lib/utils";

const TONE_DOT: Record<ToastTone, string> = {
  neutral: "bg-ivory-dim",
  open: "bg-open",
  guided: "bg-guided",
  protected: "bg-protected",
  ai: "bg-indigo-light",
};

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-sm rounded-[4px] border border-ivory/10 bg-night-2/95 text-ivory shadow-[0_24px_60px_-12px_rgb(0_0_0/0.6)] backdrop-blur-md"
          >
            <div className="flex items-start gap-3 p-4">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[t.tone])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-medium leading-snug">{t.title}</p>
                {t.body && <p className="mt-1 text-[0.8125rem] leading-snug text-ivory-dim">{t.body}</p>}
              </div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                  className="h-8 shrink-0 rounded-[3px] px-2.5 text-[0.8125rem] font-semibold text-gold-light hover:bg-ivory/[0.07]"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(t.id)}
                className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-ash hover:bg-ivory/[0.07] hover:text-ivory"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
