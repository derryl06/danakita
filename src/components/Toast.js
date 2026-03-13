'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        setToasts(prev => [...prev, { id, message, type }]);

        timersRef.current[id] = setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-[380px] pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }) {
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(onDismiss, 200);
    };

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-200',
        error: 'bg-rose-50 border-rose-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-200 ${bgColors[toast.type] || bgColors.info} ${isExiting ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-[slideDown_0.3s_ease-out]'}`}
        >
            {icons[toast.type] || icons.info}
            <span className="text-sm font-semibold text-slate-700 flex-1">{toast.message}</span>
            <button onClick={handleDismiss} className="p-1 hover:bg-white/50 rounded-full transition-colors shrink-0">
                <X className="w-4 h-4 text-slate-400" />
            </button>
        </div>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
