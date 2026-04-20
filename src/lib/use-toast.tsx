"use client";

import { useState, useEffect } from "react";
import { createContext, useContext, useCallback } from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...props, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (props: Omit<Toast, "id">) => console.log("Toast:", props),
      dismiss: () => {},
    };
  }
  return context;
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right ${
            t.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex-1">
            {t.title && <p className="font-medium">{t.title}</p>}
            {t.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
