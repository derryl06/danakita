'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Target, Flame, Trophy, Star, TrendingUp, ArrowRight, X } from 'lucide-react';

// Streak calculation utility
export function calculateStreak(transactions) {
    if (!transactions || transactions.length === 0) return 0;

    const savingDays = new Set();
    transactions.forEach(tx => {
        if (tx.type === 'in' && tx.date) {
            const d = new Date(tx.date);
            savingDays.add(d.toDateString());
        }
    });

    const sortedDays = [...savingDays].map(d => new Date(d)).sort((a, b) => b - a);
    if (sortedDays.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if most recent saving was today or yesterday
    const mostRecent = sortedDays[0];
    mostRecent.setHours(0, 0, 0, 0);

    if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
        return 0; // Streak broken
    }

    let currentDate = mostRecent;
    for (let i = 0; i < sortedDays.length; i++) {
        const dayDate = sortedDays[i];
        dayDate.setHours(0, 0, 0, 0);

        if (dayDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (dayDate.getTime() < currentDate.getTime()) {
            break;
        }
    }

    return streak;
}

// Achievement definitions
export const ACHIEVEMENTS = [
    { id: 'first_save', name: 'Penabung Pertama', desc: 'Mencatat transaksi pertama', icon: '💰', check: (stats) => stats.totalTransactions >= 1 },
    { id: 'ten_saves', name: 'Rajin Menabung', desc: '10 transaksi menabung', icon: '📊', check: (stats) => stats.totalSavings >= 10 },
    { id: 'fifty_saves', name: 'Penabung Handal', desc: '50 transaksi menabung', icon: '🏆', check: (stats) => stats.totalSavings >= 50 },
    { id: 'first_target', name: 'Pemimpi', desc: 'Membuat target pertama', icon: '🎯', check: (stats) => stats.totalTargets >= 1 },
    { id: 'three_targets', name: 'Perencana', desc: 'Membuat 3 target', icon: '📝', check: (stats) => stats.totalTargets >= 3 },
    { id: 'half_way', name: 'Setengah Jalan', desc: 'Target mencapai 50%', icon: '🏅', check: (stats) => stats.anyTargetHalf },
    { id: 'target_done', name: 'Target Selesai!', desc: 'Menyelesaikan target', icon: '🎉', check: (stats) => stats.anyTargetDone },
    { id: 'streak_7', name: 'Minggu Produktif', desc: 'Streak 7 hari', icon: '🔥', check: (stats) => stats.streak >= 7 },
    { id: 'streak_30', name: 'Konsisten Sebulan', desc: 'Streak 30 hari', icon: '⚡', check: (stats) => stats.streak >= 30 },
    { id: 'million', name: 'Jutawan', desc: 'Total tabungan 1 juta', icon: '💎', check: (stats) => stats.totalAmount >= 1000000 },
    { id: 'ten_million', name: 'Investor Muda', desc: 'Total tabungan 10 juta', icon: '👑', check: (stats) => stats.totalAmount >= 10000000 },
];

export function getUnlockedAchievements(targets, transactions) {
    const streak = calculateStreak(transactions);
    const savingsTransactions = (transactions || []).filter(tx => tx.type === 'in');
    const totalAmount = (targets || []).reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);

    const stats = {
        totalTransactions: (transactions || []).length,
        totalSavings: savingsTransactions.length,
        totalTargets: (targets || []).length,
        anyTargetHalf: (targets || []).some(t => t.target_amount > 0 && t.current_amount >= t.target_amount * 0.5),
        anyTargetDone: (targets || []).some(t => t.target_amount > 0 && t.current_amount >= t.target_amount),
        streak,
        totalAmount,
    };

    return ACHIEVEMENTS.filter(a => a.check(stats));
}

// Streak Widget Component
export function StreakBadge({ transactions, compact }) {
    const streak = calculateStreak(transactions);

    if (streak === 0) return null;

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="text-xs font-black text-orange-600">{streak} Hari</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-black text-orange-600">{streak}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Hari Streak</span>
                <span className="text-[9px] font-medium text-orange-500">Semangat terus nabung!</span>
            </div>
        </div>
    );
}

// Monthly Summary Widget
export function MonthlySummary({ transactions, isPrivacyMode }) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTx = (transactions || []).filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthTx = (transactions || []).filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisMonthIn = thisMonthTx.filter(tx => tx.type === 'in').reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const thisMonthOut = thisMonthTx.filter(tx => tx.type === 'out').reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const lastMonthIn = lastMonthTx.filter(tx => tx.type === 'in').reduce((a, t) => a + (Number(t.amount) || 0), 0);

    const growth = lastMonthIn > 0 ? ((thisMonthIn - lastMonthIn) / lastMonthIn * 100).toFixed(0) : thisMonthIn > 0 ? 100 : 0;

    const monthName = now.toLocaleDateString('id-ID', { month: 'long' });

    const fmt = (n) => {
        if (isPrivacyMode) return 'Rp •••';
        if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
        if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
        return `Rp ${n.toLocaleString('id-ID')}`;
    };

    const totalFlow = thisMonthIn + thisMonthOut;
    const inRatio = totalFlow > 0 ? (thisMonthIn / totalFlow * 100) : 0;
    const outRatio = totalFlow > 0 ? (thisMonthOut / totalFlow * 100) : 0;

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Wawasan {monthName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status Keuangan Kamu</p>
                </div>
                {Number(growth) !== 0 && (
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${Number(growth) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${Number(growth) < 0 ? 'rotate-180' : ''}`} />
                        {growth > 0 ? '+' : ''}{growth}%
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative p-4 rounded-[24px] bg-slate-50/50 border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <TrendingUp className="w-8 h-8 text-emerald-600" />
                    </div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Masuk</span>
                    <span className="text-lg font-black text-emerald-600 tracking-tight">{fmt(thisMonthIn)}</span>
                    <div className="w-full h-1 bg-emerald-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${inRatio}%` }} />
                    </div>
                </div>

                <div className="relative p-4 rounded-[24px] bg-slate-50/50 border border-slate-100 overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                        <X className="w-8 h-8 text-rose-600" />
                    </div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Keluar</span>
                    <span className="text-lg font-black text-rose-600 tracking-tight">{fmt(thisMonthOut)}</span>
                    <div className="w-full h-1 bg-rose-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${outRatio}%` }} />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Star className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-900 uppercase">Aktivitas</p>
                    <p className="text-xs font-bold text-blue-600">{thisMonthTx.length} Transaksi Tercatat</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-blue-400 uppercase">Tingkat Menabung</p>
                  <p className="text-xs font-black text-blue-700">{thisMonthIn > 0 ? (100 - (thisMonthOut / thisMonthIn * 100)).toFixed(0) : 0}%</p>
               </div>
            </div>
        </div>
    );
}

// Onboarding Component
export function OnboardingModal({ onDismiss }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Target className="w-12 h-12 text-blue-500" />,
            title: 'Selamat Datang di Dana Kita! 🎉',
            desc: 'Aplikasi pencatatan tabungan untuk membantu kamu merencanakan masa depan yang lebih baik.',
            bg: 'from-blue-500 to-indigo-600',
        },
        {
            icon: <Star className="w-12 h-12 text-amber-500" />,
            title: 'Buat Target Tabungan',
            desc: 'Tentukan target finansialmu — dana pendidikan, dana menikah, rumah, atau hadiah — lalu pantau progresnya secara real-time.',
            bg: 'from-amber-500 to-orange-600',
        },
        {
            icon: <TrendingUp className="w-12 h-12 text-emerald-500" />,
            title: 'Catat & Lacak Progres',
            desc: 'Setiap kali menabung, catat di sini. Lihat laporan, tren, dan analisis keuanganmu dalam satu genggaman.',
            bg: 'from-emerald-500 to-teal-600',
        },
        {
            icon: <Trophy className="w-12 h-12 text-purple-500" />,
            title: 'Raih Pencapaian! 🏆',
            desc: 'Kumpulkan badge, jaga streak nabung, dan ajak pasangan untuk menabung bersama. Yuk mulai!',
            bg: 'from-purple-500 to-pink-600',
        },
    ];

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
            <div className="w-[90%] max-w-[380px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
                <div className={`bg-gradient-to-br ${current.bg} p-8 flex flex-col items-center text-center relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 mb-4 relative z-10">
                        {current.icon}
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 tracking-tight relative z-10">{current.title}</h2>
                    <p className="text-sm text-white/80 leading-relaxed relative z-10">{current.desc}</p>
                </div>

                <div className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-200'}`} />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {step > 0 && (
                            <button onClick={() => setStep(step - 1)} className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
                                Kembali
                            </button>
                        )}
                        {step < steps.length - 1 ? (
                            <button onClick={() => setStep(step + 1)} className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                Lanjut <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={onDismiss} className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                                Mulai Sekarang! <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {step < steps.length - 1 && (
                        <button onClick={onDismiss} className="w-full text-center text-xs text-slate-400 mt-3 font-medium hover:text-slate-600 transition-colors">
                            Lewati
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
