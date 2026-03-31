'use client';

import { useMemo } from 'react';
import { calculateStreak } from './Gamification';
import { ShieldCheck, TrendingUp, Target, Wallet, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function calcScore(targets, transactions, monthlyBudget, expenses) {
    let score = 0;
    const details = [];

    // 1. Streak konsistensi (0-25 pts)
    const streak = calculateStreak(transactions);
    const streakPts = Math.min(25, streak * 2.5);
    score += streakPts;
    details.push({ label: 'Konsistensi', sub: `${streak} hari streak`, pts: Math.round(streakPts), max: 25, color: '#f59e0b' });

    // 2. Target progress (0-30 pts)
    const totalT = targets.reduce((s, t) => s + (Number(t.target_amount) || 0), 0);
    const totalC = targets.reduce((s, t) => s + (Number(t.current_amount) || 0), 0);
    const pct = totalT > 0 ? (totalC / totalT) : 0;
    const targetPts = Math.min(30, pct * 30);
    score += targetPts;
    details.push({ label: 'Progres Target', sub: `${(pct * 100).toFixed(0)}% tercapai`, pts: Math.round(targetPts), max: 30, color: '#3b82f6' });

    // 3. Budget adherence (0-25 pts) — only if budget is set
    const now = new Date();
    const thisMonthExpenses = (expenses || []).filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalExpenses = thisMonthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    let budgetPts = 0;
    let budgetSub = 'Budget belum diset';
    if (monthlyBudget > 0) {
        const ratio = 1 - (totalExpenses / monthlyBudget);
        budgetPts = Math.min(25, Math.max(0, ratio * 25));
        budgetSub = totalExpenses <= monthlyBudget ? `Rp ${(monthlyBudget - totalExpenses).toLocaleString('id-ID')} sisa budget` : 'Over budget bulan ini';
    } else if (targets.length > 0) {
        budgetPts = 12; // Partial score if they have targets at all
        budgetSub = 'Set budget untuk skor penuh';
    }
    score += budgetPts;
    details.push({ label: 'Kendali Pengeluaran', sub: budgetSub, pts: Math.round(budgetPts), max: 25, color: '#10b981' });

    // 4. Activity (0-20 pts)
    const recentTx = (transactions || []).filter(tx => {
        if (!tx.date || tx.type !== 'in') return false;
        const d = new Date(tx.date);
        return (now - d) < 30 * 24 * 3600 * 1000;
    });
    const activityPts = Math.min(20, recentTx.length * 2);
    score += activityPts;
    details.push({ label: 'Aktivitas Nabung', sub: `${recentTx.length} kali/30 hari`, pts: Math.round(activityPts), max: 20, color: '#8b5cf6' });

    const finalScore = Math.min(100, Math.round(score));
    return { score: finalScore, details };
}

function getGrade(score) {
    if (score >= 85) return { grade: 'A', label: 'Luar Biasa! 🏆', color: '#10b981', bg: '#d1fae5' };
    if (score >= 70) return { grade: 'B', label: 'Sangat Baik 🎯', color: '#3b82f6', bg: '#dbeafe' };
    if (score >= 55) return { grade: 'C', label: 'Cukup Baik 💪', color: '#f59e0b', bg: '#fef3c7' };
    if (score >= 40) return { grade: 'D', label: 'Perlu Ditingkatkan ⚠️', color: '#f97316', bg: '#ffedd5' };
    return { grade: 'E', label: 'Mulai Sekarang! 🌱', color: '#ef4444', bg: '#fee2e2' };
}

export default function HealthScore({ targets, transactions, monthlyBudget, expenses, isCompact }) {
    const router = useRouter();
    const { score, details } = useMemo(
        () => calcScore(targets, transactions, monthlyBudget, expenses),
        [targets, transactions, monthlyBudget, expenses]
    );
    const { grade, label, color, bg } = getGrade(score);

    const circumference = 2 * Math.PI * 42;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

    if (isCompact) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-2 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Health</h3>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f8fafc" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={color} strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={strokeDasharray}
                                style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black" style={{ color }}>{score}</span>
                            <span className="text-[10px] font-bold" style={{ color: '#94a3b8' }}>{grade}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 text-center">
                   <p className="text-[10px] font-black" style={{ color }}>{label}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skor Kesehatan Finansial</h3>
            </div>

            <div className="flex items-center gap-5 mb-5">
                {/* Circular gauge */}
                <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                        <circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke={color} strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black" style={{ color }}>{score}</span>
                        <span className="text-[10px] font-bold" style={{ color }}>{grade}</span>
                    </div>
                </div>

                {/* Label + sub */}
                <div className="flex-1">
                    <div className="inline-block px-3 py-1.5 rounded-xl text-xs font-black mb-2" style={{ backgroundColor: bg, color }}>
                        {label}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Berdasarkan streak, progres target, kendali pengeluaran & aktivitas nabung kamu.
                    </p>
                </div>
            </div>

            {/* Score breakdown */}
            <div className="flex flex-col gap-2.5">
                {details.map(d => (
                    <div key={d.label}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-bold text-slate-600">{d.label}</span>
                            <span className="text-[11px] font-black" style={{ color: d.color }}>{d.pts}/{d.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.pts / d.max) * 100}%`, backgroundColor: d.color }} />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">{d.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
