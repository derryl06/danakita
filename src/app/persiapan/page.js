'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /persiapan to /laporan - this page is no longer in the navigation
export default function PersiapanRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/laporan');
    }, [router]);

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen">
            <div className="skeleton h-8 w-32 mb-4" />
            <p className="text-sm text-slate-400">Mengalihkan ke Laporan...</p>
        </main>
    );
}
