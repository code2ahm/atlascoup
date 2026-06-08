import { useEffect } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set(state => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }],
  })),
  removeToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
}));

export function useToast() {
  const addToast = useToastStore(s => s.addToast);
  return {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    info: (message) => addToast({ type: 'info', message }),
    warning: (message) => addToast({ type: 'warning', message }),
  };
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
};

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed top-0 left-0 right-0 sm:top-4 sm:right-4 sm:left-auto z-[100] flex flex-col gap-2 px-3 pt-3 sm:px-0 sm:pt-0 sm:max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return <ToastItem key={toast.id} toast={toast} Icon={Icon} onRemove={removeToast} />;
        })}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, Icon, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        'pointer-events-auto flex items-start gap-2 sm:gap-3 rounded-lg border backdrop-blur-xl shadow-lg',
        'p-3 sm:p-4',
        colors[toast.type]
      )}
    >
      <Icon className="h-4 w-4 sm:h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-xs sm:text-sm flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default ToastContainer;
