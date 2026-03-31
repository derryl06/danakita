'use client';

import { useState } from 'react';
import { Share2, X, Download, TrendingUp, TrendingDown, Wallet, Target, Award } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { calculateStreak } from './Gamification';

export default function MonthlyDigest({ isOpen, onClose, targets, transactions, expenses, isPrivacyMode }) {
    const [shared, setShared] = useState(false);

    const now = new Date();
    const monthName = format(now, 'MMMM yyyy', { locale: id });

    const thisMonth = (arr, type = null) => {
        return (arr || []).filter(tx => {
            const d = new Date(tx.date);
            const match = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (!match) return false;
            if (type) return tx.type === type;
            return true;
        });
    };

    const savedThisMonth = thisMonth(transactions, 'in').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const withdrawThisMonth = thisMonth(transactions, 'out').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const spentThisMonth = (expenses || []).filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalSaved = (targets || []).reduce((s, t) => s + (Number(t.current_amount) || 0), 0);
    const totalTarget = (targets || []).reduce((s, t) => s + (Number(t.target_amount) || 0), 0);
    const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;
    const streak = calculateStreak(transactions || []);

    const fmt = (n) => {
        if (isPrivacyMode) return 'Rp •••••';
        if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
        if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
        return `Rp ${n.toLocaleString('id-ID')}`;
    };

    const digestText = `📊 *Laporan Dana Kita — ${monthName}*

💰 Menabung: ${fmt(savedThisMonth)}
💸 Pengeluaran: ${fmt(spentThisMonth)}
🎯 Progress Total: ${overallProgress}%
🔥 Streak: ${streak} hari
📈 Total Terkumpul: ${fmt(totalSaved)} dari ${fmt(totalTarget)}

_Laporan dari Dana Kita App — Rencanakan masa depanmu!_`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `Laporan Dana Kita ${monthName}`, text: digestText });
                setShared(true);
            } catch (e) { /* user cancelled */ }
        } else {
            navigator.clipboard.writeText(digestText);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }
    };

    if (!isOpen) return null;

    const stats = [
        { icon: TrendingUp, label: 'Menabung', value: fmt(savedThisMonth), color: '#10b981', bg: '#d1fae5' },
        { icon: TrendingDown, label: 'Pengeluaran', value: fmt(spentThisMonth), color: '#ef4444', bg: '#fee2e2' },
        { icon: Wallet, label: 'Total Terkumpul', value: fmt(totalSaved), color: '#3b82f6', bg: '#dbeafe' },
        { icon: Target, label: 'Progress', value: `${overallProgress}%`, color: '#8b5cf6', bg: '#ede9fe' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-[420px] mx-4 mb-6 bg-white rounded-[32px] shadow-2xl overflow-hidden animate-[scaleIn_0.25s_ease-out]" onClick={e => e.stopPropagation()}>

                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-6 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-all">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="relative z-10">
                        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Ringkasan Bulanan</p>
                        <h2 className="text-2xl font-black tracking-tight">{monthName}</h2>
                        {streak > 0 && (
                            <div className="flex items-center gap-1.5 mt-3 bg-white/20 w-fit px-3 py-1.5 rounded-full">
                                <Award className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-xs font-bold">🔥 {streak} Hari Streak!</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="rounded-2xl p-4 border border-slate-100">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: bg }}>
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                                <p className="text-sm font-black" style={{ color }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Target list */}
                    {targets.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status Target</p>
                            <div className="flex flex-col gap-2.5">
                                {targets.slice(0, 3).map(t => {
                                    const pct = t.target_amount > 0 ? Math.min(100, (t.current_amount / t.target_amount) * 100) : 0;
                                    return (
                                        <div key={t.id}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[140px]">{t.name}</span>
                                                <span className="text-[11px] font-black text-slate-500">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${shared ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30'}`}
                    >
                        {shared ? (
                            <><TrendingUp className="w-5 h-5" /> Tersalin / Dibagikan! ✅</>
                        ) : (
                            <><Share2 className="w-5 h-5" /> Bagikan ke WhatsApp / Story</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
