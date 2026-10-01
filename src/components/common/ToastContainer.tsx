import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStudioData } from '../../context/StudioDataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStudioData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let bgClass = 'bg-white border-emerald-200 text-gray-900';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-500';

        if (toast.type === 'error') {
          bgClass = 'bg-white border-rose-200 text-gray-900';
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-white border-amber-200 text-gray-900';
          Icon = AlertTriangle;
          iconColor = 'text-amber-500';
        } else if (toast.type === 'info') {
          bgClass = 'bg-white border-blue-200 text-gray-900';
          Icon = Info;
          iconColor = 'text-blue-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
