'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, PlusCircle, Clock, User } from 'lucide-react';
import { useQuickAdd } from '../context/QuickAddContext';
import clsx from 'clsx';
import QuickAddSheet from './QuickAddSheet';

export default function BottomNav() {
    const pathname = usePathname();
    const { setIsOpen } = useQuickAdd();

    const tabs = [
        { name: 'Beranda', href: '/', icon: Home },
        { name: 'Target', href: '/target', icon: Target },
        { name: 'Tambah', action: () => setIsOpen(true), icon: PlusCircle, isMain: true },
        { name: 'Checklist', href: '/persiapan', icon: Clock },
        { name: 'Profil', href: '/profil', icon: User },
    ];

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl px-4 py-3 z-50">
                <div className="flex justify-between items-center text-xs">
                    {tabs.map((tab, idx) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;

                        if (tab.action) {
                            return (
                                <button
                                    key={idx}
                                    onClick={tab.action}
                                    className="flex flex-col items-center justify-center -mt-8 gap-1 group relative z-10"
                                >
                                    <div className="bg-gradient-to-tr from-[var(--color-primary)] to-blue-400 rounded-full p-3.5 shadow-lg shadow-blue-500/30 border-4 border-white group-hover:-translate-y-1 transition-transform duration-300">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-slate-500 font-medium text-[10px] mt-1 group-hover:text-[var(--color-primary)] transition-colors">{tab.name}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={tab.href}
                                className={clsx(
                                    "flex flex-col items-center gap-1.5 p-2 w-16 transition-all duration-300 hover:-translate-y-0.5 relative",
                                    isActive ? "text-[var(--color-primary)] font-bold" : "text-slate-400 font-medium hover:text-slate-600"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute -top-3 w-8 h-1 bg-[var(--color-primary)] rounded-b-full"></div>
                                )}
                                <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                                <span>{tab.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            <QuickAddSheet />
        </>
    );
}
