'use client';

import TopBar from '../../components/TopBar';
import { User, LogIn, UserPlus, Settings, HelpCircle, ChevronRight, LogOut, Link2, Copy, CheckCircle2, AlertCircle, Trophy, Flame, FileText, Target as TargetIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { calculateStreak, getUnlockedAchievements } from '../../components/Gamification';

export default function ProfilPage() {
    const { user, profile, joinHousehold, targets, transactions } = useAppContext();
    const { addToast } = useToast();
    const router = useRouter();
    const [joinId, setJoinId] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const streak = useMemo(() => calculateStreak(transactions), [transactions]);
    const achievements = useMemo(() => getUnlockedAchievements(targets, transactions), [targets, transactions]);

    const handleLogout = async () => {
        await signOut(auth);
        addToast('Berhasil keluar dari akun', 'info');
        router.push('/');
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await joinHousehold(joinId);
        setLoading(false);
        if (res.success) {
            setStatus({ type: 'success', message: 'Berhasil bergabung!' });
            setJoinId('');
            addToast('Berhasil bergabung dengan household!', 'success');
        } else {
            setStatus({ type: 'error', message: res.message || 'Gagal bergabung' });
            addToast(res.message || 'Gagal bergabung', 'error');
        }
        setTimeout(() => setStatus(null), 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addToast('ID berhasil disalin!', 'success');
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] page-transition">
            <TopBar title="Profil Pengguna" />

            <div className="px-5 mt-6 flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-br from-[var(--color-primary)] to-blue-700 rounded-[32px] p-8 shadow-xl shadow-blue-500/20 flex flex-col items-center text-center mt-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md border border-white/40 rounded-[28px] shadow-inner flex items-center justify-center mb-5 relative z-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <User className="w-12 h-12 text-white" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-white mb-2 relative z-10 tracking-tight leading-tight">
                        {user ? user.email.split('@')[0] : 'Guest User'}
                    </h2>
                    <span className="bg-white/20 text-blue-50 text-[10px] px-3.5 py-1.5 rounded-full font-bold border border-white/30 backdrop-blur-md relative z-10 shadow-sm uppercase tracking-wider">
                        {user ? 'Akun Aktif (Online)' : 'Belum Login'}
                    </span>

                    {/* Stats Row */}
                    <div className="flex gap-4 mt-6 relative z-10">
                        {streak > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                <Flame className="w-3.5 h-3.5 text-orange-300" />
                                <span className="text-xs font-black text-white">{streak}🔥</span>
                            </div>
                        )}
                        {achievements.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-xs font-black text-white">{achievements.length} Badge</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full flex gap-3 mt-6 relative z-10">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 rounded-[20px] border border-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Keluar Akun
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className="flex-1 bg-white text-[var(--color-primary)] font-bold py-3.5 rounded-[16px] hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-300 shadow-lg active:scale-[0.98] flex justify-center items-center gap-2">
                                    <LogIn className="w-4 h-4" /> Masuk
                                </Link>
                                <Link href="/login" className="flex-1 bg-blue-600/30 border border-white/30 text-white font-bold py-3.5 rounded-[16px] hover:bg-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {user && profile && (
                    <div className="w-full mt-6 bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-blue-100/50 transition-colors"></div>

                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                            <Link2 className="w-4 h-4 text-blue-500" /> Partner Sync (Household)
                        </h3>

                        <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 mb-5 border border-slate-100 relative z-10">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 opacity-70">ID Household Kamu (Bagikan ke Pasangan)</span>
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200/50 shadow-sm">
                                <code className="text-xs font-black text-blue-600 truncate mr-2 select-all px-1">{profile.household_id}</code>
                                <button onClick={() => copyToClipboard(profile.household_id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all active:scale-95 group/copy">
                                    <Copy className="w-3.5 h-3.5 group-hover/copy:scale-110" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleJoin} className="flex flex-col gap-3 relative z-10">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1 opacity-70">Gabung ke ID Pasangan</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={e => setJoinId(e.target.value)}
                                    placeholder="Masukkan ID Pasangan..."
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm placeholder:text-slate-300 transition-all"
                                />
                                <button
                                    disabled={loading || !joinId}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 shadow-md"
                                >
                                    {loading ? '...' : 'GABUNG'}
                                </button>
                            </div>

                            {status && (
                                <div className={`flex items-center gap-2 text-[10px] font-bold mt-1 px-4 py-2.5 rounded-xl animate-[fadeInUp_0.2s_ease-out] ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {status.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                    {status.message}
                                </div>
                            )}
                        </form>
                    </div>
                )}

                <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-500 mt-6 overflow-hidden">
                    <MemoizedMenuLink href="/laporan" icon={<FileText className="w-5 h-5 text-blue-500" />} title="Laporan & Analisis" />
                    <div className="h-[1px] w-[calc(100%-2.5rem)] ml-auto bg-slate-100" />
                    <MemoizedMenuLink href="/target" icon={<TargetIcon className="w-5 h-5 text-emerald-500" />} title="Target Tabungan" />
                    <div className="h-[1px] w-[calc(100%-2.5rem)] ml-auto bg-slate-100" />
                    <MemoizedMenuLink href="/pengaturan" icon={<Settings className="w-5 h-5 text-slate-500" />} title="Pengaturan Aplikasi" />
                    <div className="h-[1px] w-[calc(100%-2.5rem)] ml-auto bg-slate-100" />
                    <MemoizedMenuLink href="/bantuan" icon={<HelpCircle className="w-5 h-5 text-slate-500" />} title="Pusat Bantuan & FAQ" />
                </div>

                <p className="text-xs text-slate-400 font-medium mt-10">
                    Dana Kita v1.1 • Dibuat dengan ❤️
                </p>
            </div>
        </main>
    );
}

function MemoizedMenuLink({ href, icon, title }) {
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
