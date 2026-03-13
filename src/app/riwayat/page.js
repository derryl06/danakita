'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /riwayat to /transaksi to avoid duplicate pages
export default function RiwayatRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/transaksi');
    }, [router]);

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen">
            <div className="skeleton h-8 w-32 mb-4" />
            <p className="text-sm text-slate-400">Mengalihkan...</p>
        </main>
    );
}
