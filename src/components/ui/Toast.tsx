"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/src/utils/cn";

type ToastTone = "info" | "success" | "error";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

const ToastContext = createContext<((tone: ToastTone, message: string) => void) | null>(null);

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used within <ToastProvider>");
  return push;
}

const toneConfig: Record<ToastTone, { className: string; Icon: typeof Info }> = {
  info: { className: "border-trust-blue/30 bg-trust-blue-tint text-trust-blue", Icon: Info },
  success: { className: "border-success/30 bg-success-tint text-success", Icon: CheckCircle2 },
  error: { className: "border-error/30 bg-error-tint text-error", Icon: AlertCircle },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map(({ id, tone, message }) => {
          const { className, Icon } = toneConfig[tone];
          return (
            <div
              key={id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-control border bg-surface px-4 py-3 shadow-card",
                className,
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1 text-small font-medium text-ink">{message}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== id))}
                className="text-muted hover:text-ink"
                aria-label="إغلاق"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
