import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-amber-500",
    info: "bg-blue-600",
  };

  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colors[t.type]} text-white flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium min-w-64 max-w-sm animate-in pointer-events-auto`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">
              {icons[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
