"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const ToastContext = createContext({
  show: (message: string, type: string = "info") => {},
});

type ToastItem = {
  id: string;
  message: string;
  type: string;
};

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function show(message: string, type: string = "info") {
    const id = Math.random().toString(36);

    setToasts((t) => [...t, { id, message, type }]);

    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-lg text-white ${
              t.type === "error" ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
