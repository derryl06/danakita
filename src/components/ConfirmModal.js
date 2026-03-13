'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', cancelText = 'Batal', type = 'danger' }) {
    if (!isOpen) return null;

    const btnColors = {
        danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
        warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    };

    const iconColors = {
        danger: 'bg-rose-50 text-rose-600',
        warning: 'bg-amber-50 text-amber-600',
        info: 'bg-blue-50 text-blue-600',
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-[90%] max-w-[340px] bg-white rounded-[28px] p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full mb-4 ${iconColors[type]}`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${btnColors[type]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
