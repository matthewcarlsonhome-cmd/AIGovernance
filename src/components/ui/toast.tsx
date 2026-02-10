'use client';

import * as React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
};

const styles: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
};

const textStyles: Record<ToastType, string> = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const messageStyles: Record<ToastType, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = options.duration ?? (options.type === 'error' ? 8000 : 5000);
    setToasts(prev => [...prev, { ...options, id, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full',
              styles[t.type]
            )}
            role="alert"
          >
            <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', textStyles[t.type])}>{t.title}</p>
              {t.message && (
                <p className={cn('text-sm mt-1', messageStyles[t.type])}>{t.message}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
