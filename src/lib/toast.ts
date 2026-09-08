"use client";

export type ToastKind = "success" | "error" | "info";
export type ToastItem = { id: number; kind: ToastKind; message: string };

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  for (const l of listeners) l([...toasts]);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function toast(message: string, kind: ToastKind = "info") {
  const id = nextId++;
  toasts = [...toasts, { id, kind, message }];
  emit();
  setTimeout(() => dismiss(id), 4000);
}

export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

toast.success = (m: string) => toast(m, "success");
toast.error = (m: string) => toast(m, "error");
toast.info = (m: string) => toast(m, "info");
