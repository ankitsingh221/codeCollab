import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);
  // Track recent toast messages to prevent duplicates within 2 seconds
  const recentToasts = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = ++toastIdCounter.current;

    // Create a unique key for the toast
    const key = `${title}|${description}|${variant}`;
    const now = Date.now();

    // Check if this exact toast was shown recently (within 2 seconds)
    if (recentToasts.current.has(key)) {
      const lastShown = recentToasts.current.get(key);
      if (now - lastShown < 2000) {
        return; // Skip duplicate toast
      }
    }

    // Store the toast in recent toasts
    recentToasts.current.set(key, now);

    // Clean up old entries (older than 5 seconds)
    for (const [k, time] of recentToasts.current.entries()) {
      if (now - time > 5000) {
        recentToasts.current.delete(k);
      }
    }

    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      // Remove from recent toasts after 5 seconds
      setTimeout(() => {
        recentToasts.current.delete(key);
      }, 5000);
    }, 4000);
  }, []);

  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "destructive":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (variant) => {
    switch (variant) {
      case "success":
        return {
          panel: "from-emerald-500/10 via-teal-400/5 to-white/90",
          border: "border-emerald-200/80",
          title: "text-slate-800",
          desc: "text-slate-600",
          iconBg: "bg-emerald-50",
          iconText: "text-emerald-600",
          shadow: "shadow-[0_18px_45px_rgba(16,185,129,0.15)]",
          accent: "from-emerald-500 to-teal-400",
        };
      case "destructive":
        return {
          panel: "from-rose-500/10 via-red-400/5 to-white/90",
          border: "border-rose-200/80",
          title: "text-slate-800",
          desc: "text-slate-600",
          iconBg: "bg-rose-50",
          iconText: "text-rose-600",
          shadow: "shadow-[0_18px_45px_rgba(244,63,94,0.16)]",
          accent: "from-rose-500 to-red-400",
        };
      case "warning":
        return {
          panel: "from-amber-500/10 via-orange-400/5 to-white/90",
          border: "border-amber-200/80",
          title: "text-slate-800",
          desc: "text-slate-600",
          iconBg: "bg-amber-50",
          iconText: "text-amber-600",
          shadow: "shadow-[0_18px_45px_rgba(245,158,11,0.16)]",
          accent: "from-amber-500 to-orange-400",
        };
      default:
        return {
          panel: "from-sky-500/10 via-cyan-400/5 to-white/90",
          border: "border-sky-200/80",
          title: "text-slate-800",
          desc: "text-slate-600",
          iconBg: "bg-sky-50",
          iconText: "text-sky-600",
          shadow: "shadow-[0_18px_45px_rgba(14,165,233,0.15)]",
          accent: "from-sky-500 to-cyan-400",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex w-[min(92vw,24rem)] flex-col items-end gap-3 pointer-events-none">
        {toasts.map(({ id, title, description, variant }) => {
          const styles = getStyles(variant);
          const Icon = getIcon(variant);

          return (
            <div
              key={id}
              className={`toast-enter pointer-events-auto relative overflow-hidden rounded-[22px] border bg-gradient-to-br ${styles.panel} ${styles.border} ${styles.shadow} p-4 backdrop-blur-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.accent}`}
              />
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} ${styles.iconText}`}
                >
                  {Icon}
                </div>
                <div className="min-w-0 flex-1">
                  {title && (
                    <p className={`text-sm font-semibold ${styles.title}`}>
                      {title}
                    </p>
                  )}
                  {description && (
                    <p className={`mt-1 text-sm leading-5 ${styles.desc}`}>
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(id)}
                  className="shrink-0 rounded-xl p-1.5 text-slate-400 transition-colors duration-200 hover:bg-white/70 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .toast-enter {
          animation: toastEnter 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
};
