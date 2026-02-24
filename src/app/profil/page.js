'use client';

import TopBar from '../../components/TopBar';
import { User, LogIn, UserPlus, Settings, HelpCircle, ChevronRight } from 'lucide-react';

import Link from 'next/link';

export default function ProfilPage() {
    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)]">
            <TopBar title="Profil Pengguna" />

            <div className="px-5 mt-6 flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-br from-[var(--color-primary)] to-blue-700 rounded-[32px] p-8 shadow-xl shadow-blue-500/20 flex flex-col items-center text-center mt-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md border border-white/40 rounded-[28px] shadow-inner flex items-center justify-center mb-5 relative z-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <User className="w-12 h-12 text-white" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-white mb-2 relative z-10 tracking-tight">Guest User</h2>
                    <span className="bg-white/20 text-blue-50 text-xs px-3.5 py-1.5 rounded-full font-bold border border-white/30 backdrop-blur-md relative z-10 shadow-sm">
                        Belum Login
                    </span>

                    <div className="w-full flex gap-3 mt-8 relative z-10">
                        <button className="flex-1 bg-white text-[var(--color-primary)] font-bold py-3.5 rounded-[16px] hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-300 shadow-lg active:scale-[0.98] flex justify-center items-center gap-2">
                            <LogIn className="w-4 h-4" /> Masuk
                        </button>
                        <button className="flex-1 bg-blue-600/30 border border-white/30 text-white font-bold py-3.5 rounded-[16px] hover:bg-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Daftar
                        </button>
                    </div>
                </div>

                <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-500 mt-6 overflow-hidden">
                    <MenuLink href="/pengaturan" icon={<Settings className="w-5 h-5 text-slate-500" />} title="Pengaturan Aplikasi" />
                    <div className="h-[1px] w-[calc(100%-2.5rem)] ml-auto bg-slate-100" />
                    <MenuLink href="/bantuan" icon={<HelpCircle className="w-5 h-5 text-slate-500" />} title="Pusat Bantuan & FAQ" />
                </div>

                <p className="text-xs text-slate-400 font-medium mt-10">
                    SiapDana Alpha v0.1 • Dibuat dengan cinta
                </p>
            </div>
        </main>
    );
}

function MenuLink({ href, icon, title }) {
    return (
        <Link href={href || "#"} className="flex justify-between items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors duration-200 active:bg-slate-100 group">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100 rounded-[14px]">
                    {icon}
                </div>
                <span className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">{title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}
