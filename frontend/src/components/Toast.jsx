import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { removeToast(id); }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const types = {
    success: { icon: CheckCircle, cls: 'border-emerald-500/20', bg: 'bg-emerald-500/5', color: 'text-emerald-400' },
    error: { icon: AlertCircle, cls: 'border-red-500/20', bg: 'bg-red-500/5', color: 'text-red-400' },
    info: { icon: Info, cls: 'border-blue-500/20', bg: 'bg-blue-500/5', color: 'text-blue-400' },
  };

  const config = types[toast.type] || types.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.92, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-lg ${config.bg} ${config.cls} glass-strong`}
    >
      <div className={`p-1.5 rounded-lg ${config.bg} ${config.cls}`}>
        <Icon className={`w-4.5 h-4.5 ${config.color}`} />
      </div>
      <p className="flex-1 text-sm text-slate-200 font-medium">{toast.message}</p>
      <button onClick={onRemove} className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
