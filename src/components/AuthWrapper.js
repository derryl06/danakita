'use client';

import { useAppContext } from '../context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }) {
    const { user } = useAppContext();
    const pathname = usePathname();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Just stop loading after a brief moment
        const timer = setTimeout(() => {
            setChecking(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (checking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Dana Kita...</p>
            </div>
        );
    }

    return <>{children}</>;
}
