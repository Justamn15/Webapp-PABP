import React from 'react';
import { ToastMessage } from '../types.ts';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let bg = 'bg-emerald-700 text-white border-emerald-600';
        let Icon = CheckCircle2;

        if (toast.type === 'error') {
          bg = 'bg-rose-700 text-white border-rose-600';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-700 text-white border-amber-600';
          Icon = AlertTriangle;
        } else if (toast.type === 'info') {
          bg = 'bg-indigo-700 text-white border-indigo-600';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`${bg} pointer-events-auto border px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-2`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white p-1 rounded transition shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
