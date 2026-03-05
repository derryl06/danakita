'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Periksa apakah user sudah menolak dalam 7 hari terakhir
            const lastDismissed = localStorage.getItem('dk_pwa_dismissed');
            if (lastDismissed) {
                const isExpired = (Date.now() - parseInt(lastDismissed, 10)) > 7 * 24 * 60 * 60 * 1000;
                if (!isExpired) return;
            }

            // Show our custom UI
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // delay prompt 3 detik setelah app kebuka
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        setShowPrompt(false);
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('dk_pwa_dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-0 w-full px-4 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500 flex justify-center pointer-events-none">
            <div className="bg-slate-900 w-full max-w-sm rounded-[24px] p-4 shadow-2xl flex items-center justify-between gap-4 pointer-events-auto border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>

                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-400 relative z-10 shadow-inner">
                    <Smartphone className="w-6 h-6" />
                </div>

                <div className="flex-1 relative z-10">
                    <h4 className="text-white text-sm font-bold">Install Dana Kita</h4>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide font-semibold mt-0.5">Akses lebih cepat & offline</p>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleInstall}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
