"use client";

import { create } from "zustand";
import type { Role } from "@/types";
import { uid } from "@/lib/utils";

export type ToastTone = "neutral" | "open" | "guided" | "protected" | "ai";

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface UIState {
  /** Role the interface is currently crossing into, while the curtain is drawn. */
  crossingTo: Role | null;
  toasts: Toast[];
  beginCrossing: (to: Role) => void;
  endCrossing: () => void;
  toast: (toast: Omit<Toast, "id" | "tone"> & { tone?: ToastTone }) => void;
  dismissToast: (id: string) => void;
}

export const useUI = create<UIState>()((set) => ({
  crossingTo: null,
  toasts: [],
  beginCrossing: (to) => set({ crossingTo: to }),
  endCrossing: () => set({ crossingTo: null }),
  toast: (toast) => {
    const id = uid("toast");
    set((s) => ({ toasts: [...s.toasts.slice(-2), { tone: "neutral", ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), toast.action ? 7000 : 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
