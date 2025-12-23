import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const icons = {
        success: <CheckCircle className="text-green-400" size={20} />,
        error: <AlertCircle className="text-red-400" size={20} />,
        info: <Info className="text-blue-400" size={20} />
    };

    const bgColors = {
        success: 'bg-slate-900 border-green-500/20',
        error: 'bg-slate-900 border-red-500/20',
        info: 'bg-slate-900 border-blue-500/20'
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-xl w-80 animate-slide-in ${bgColors[toast.type]}`}>
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{toast.message}</p>
            </div>
            <button onClick={() => onClose(toast.id)} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map(t => (
            <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
    </div>
);
