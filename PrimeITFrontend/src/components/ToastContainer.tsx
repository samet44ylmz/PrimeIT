import React from 'react';
import { useToast } from '../store/ToastContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastItem: React.FC<{ id: string; message: string; type: string }> = ({ id, message, type }) => {
  const { removeToast } = useToast();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  };

  const borders = {
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
    info: 'border-indigo-500/20',
    warning: 'border-amber-500/20',
  };

  const shadows = {
    success: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    error: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    info: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]',
    warning: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
  };

  return (
    <div 
      className={`flex items-center gap-4 p-5 rounded-2xl bg-[#0A0A0C]/80 backdrop-blur-xl border ${borders[type as keyof typeof borders]} ${shadows[type as keyof typeof shadows]} animate-float-in min-w-[320px] max-w-md group relative overflow-hidden`}
    >
      {/* Decorative gradient background */}
      <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br from-white to-transparent pointer-events-none`}></div>
      
      <div className="flex-shrink-0">
        {icons[type as keyof typeof icons]}
      </div>
      
      <div className="flex-1">
         <p className="text-sm font-medium text-white/90 leading-snug tracking-tight">
          {message}
        </p>
      </div>

      <button 
        onClick={() => removeToast(id)}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:bg-white/5 hover:text-white transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar Animation */}
      <div className={`absolute bottom-0 left-0 h-[2px] bg-white/10 animate-toast-progress w-full overflow-hidden`}>
          <div className={`h-full w-full bg-current ${type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-red-500' : 'text-indigo-500'} opacity-20`}></div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-10 right-10 z-[1000] flex flex-col gap-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
};
