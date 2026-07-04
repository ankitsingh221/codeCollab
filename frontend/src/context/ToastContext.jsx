import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
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

  const toast = useCallback(({ title, description, variant = 'default' }) => {
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
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'destructive':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStyles = (variant) => {
    switch (variant) {
      case 'success':
        return {
          bg: 'from-green-500/20 to-emerald-500/10',
          border: 'border-green-500/30',
          title: 'text-green-400',
          desc: 'text-green-300/70',
          glow: 'shadow-green-500/10'
        };
      case 'destructive':
        return {
          bg: 'from-rose-500/20 to-red-500/10',
          border: 'border-rose-500/30',
          title: 'text-rose-400',
          desc: 'text-rose-300/70',
          glow: 'shadow-rose-500/10'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500/20 to-amber-500/10',
          border: 'border-yellow-500/30',
          title: 'text-yellow-400',
          desc: 'text-yellow-300/70',
          glow: 'shadow-yellow-500/10'
        };
      default:
        return {
          bg: 'from-cyan-500/20 to-blue-500/10',
          border: 'border-cyan-500/30',
          title: 'text-cyan-400',
          desc: 'text-cyan-300/70',
          glow: 'shadow-cyan-500/10'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map(({ id, title, description, variant }) => {
          const styles = getStyles(variant);
          const Icon = getIcon(variant);
          
          return (
            <div
              key={id}
              className={`pointer-events-auto relative bg-gradient-to-br ${styles.bg} backdrop-blur-xl border ${styles.border} rounded-2xl p-4 shadow-2xl ${styles.glow} animate-in slide-in-from-top-5 duration-300 hover:scale-[1.02] transition-transform`}
            >
              {/* Animated progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shrink"></div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {Icon}
                </div>
                <div className="flex-1 min-w-0">
                  {title && (
                    <p className={`font-semibold text-sm ${styles.title}`}>
                      {title}
                    </p>
                  )}
                  {description && (
                    <p className={`text-sm ${styles.desc} mt-0.5`}>
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(id)}
                  className="shrink-0 text-white/30 hover:text-white/70 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 4s linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};