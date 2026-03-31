'use client';

import { useAppContext } from '../context/AppContext';
import { useQuickAdd } from '../context/QuickAddContext';
import TopBar from '../components/TopBar';
import GoalCard from '../components/GoalCard';
import { StreakBadge, MonthlySummary } from '../components/Gamification';
import SavingsHeatmap from '../components/SavingsHeatmap';
import HealthScore from '../components/HealthScore';
import MonthlyDigest from '../components/MonthlyDigest';
import { differenceInMonths, parseISO, isValid } from 'date-fns';
import { ArrowRight, Sparkles, Calendar, Eye, EyeOff, Wallet, Target, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Beranda() {
  const { targets, transactions, isDemoMode, loadDemoData, clearData, deleteTarget, isPrivacyMode, togglePrivacyMode, monthlyBudget, isLoading, expenses, debts } = useAppContext();
  const { setIsOpen } = useQuickAdd();
  const router = useRouter();
  const [showDigest, setShowDigest] = useState(false);

  const targetUtama = useMemo(() => {
    if (targets.length === 0) return null;
    const totalTarget = targets.reduce((acc, t) => acc + (Number(t.target_amount) || 0), 0);
    const totalCurrent = targets.reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);

    const validDeadlines = targets
      .filter(t => t.deadline)
      .map(t => parseISO(t.deadline))
      .filter(d => isValid(d));
    const furthestDeadline = validDeadlines.length > 0 ? new Date(Math.max(...validDeadlines.map(d => d.getTime()))) : null;

    return {
      id: 'main',
      name: 'Dana Keseluruhan',
      target_amount: totalTarget,
      current_amount: totalCurrent,
      deadline: furthestDeadline ? furthestDeadline.toISOString() : null
    };
  }, [targets]);

  const { perMonth, status, type } = useMemo(() => {
    if (!targetUtama || !targetUtama.deadline || targetUtama.target_amount <= 0) {
      return { perMonth: 0, status: 'Belum disetel', type: 'neutral' };
    }

    const parsedDate = parseISO(targetUtama.deadline);
    if (!isValid(parsedDate)) return { perMonth: 0, status: 'Belum disetel', type: 'neutral' };

    const sisaBulan = differenceInMonths(parsedDate, new Date());
    const effectiveSisaBulan = sisaBulan <= 0 ? 0 : sisaBulan;
    const sisaTarget = targetUtama.target_amount - targetUtama.current_amount;
    if (sisaTarget <= 0) return { perMonth: 0, status: 'Tercapai 🎉', type: 'success' };
    if (effectiveSisaBulan <= 0) return { perMonth: 0, status: 'Deadline berlalu', type: 'warning' };

    const butuhPerBulan = sisaTarget / effectiveSisaBulan;
    return { perMonth: butuhPerBulan, status: 'On track', type: 'success' };
  }, [targetUtama]);

  const monthlyBudgetProgress = useMemo(() => {
    if (monthlyBudget <= 0) return null;
    const now = new Date();
    const thisMonthSavings = (transactions || [])
      .filter(tx => {
        if (!tx.date || tx.type !== 'in') return false;
        const d = new Date(tx.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((a, t) => a + (Number(t.amount) || 0), 0);
    return { saved: thisMonthSavings, target: monthlyBudget, percent: Math.min(100, (thisMonthSavings / monthlyBudget) * 100) };
  }, [monthlyBudget, transactions]);

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col min-h-screen pb-24 page-transition">
        <TopBar title="Dana Kita" subtitle="Memuat..." />
        <div className="px-5 mt-6 flex flex-col gap-4">
          <div className="skeleton h-48 w-full rounded-[32px]" />
          <div className="skeleton h-24 w-full rounded-[24px]" />
          <div className="skeleton h-24 w-full rounded-[24px]" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen pb-24 page-transition">
      <TopBar
        title="Dana Kita"
        subtitle="Mulai persiapkan masa depanmu"
        rightComponent={
          <div className="flex items-center gap-2">
            <button
              onClick={togglePrivacyMode}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
              title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            >
              {isPrivacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={() => router.push('/transaksi')}
              className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="px-5 mt-6 flex-1 flex flex-col">
        {isDemoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 flex justify-between items-center text-sm shadow-sm">
            <div className="flex items-center gap-2 text-blue-800">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Mode contoh aktif. Data simulasi.</span>
            </div>
            <button onClick={clearData} className="text-xs font-bold text-blue-700 underline">
              Reset
            </button>
          </div>
        )}

        {(!targets || targets.length === 0) ? (
          <div className="flex flex-col mt-4 mb-auto pt-4">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">Mulai Menabung</h2>
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col items-center justify-center py-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h1 className="z-10 text-4xl font-extrabold text-slate-800 mb-2">Rp 0</h1>
              <p className="z-10 text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Belum ada target aktif</p>
              <div className="z-10 w-full flex flex-col gap-3">
                <button onClick={() => router.push('/target')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  Setel Target <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={loadDemoData} className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold text-sm">
                  Coba Contoh Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Header Area: Streak & Share */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <StreakBadge transactions={transactions} compact={true} />
                </div>
                <button 
                  onClick={() => setShowDigest(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 hover:bg-indigo-100 transition-all"
                >
                  <Share2 className="w-3 h-3" /> Digest
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[34px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{targetUtama?.name || 'Total Tabungan'}</p>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      {isPrivacyMode ? 'Rp ••••••' : `Rp ${targetUtama?.current_amount?.toLocaleString('id-ID') || '0'}`}
                    </h2>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {status}
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden mb-5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${targetUtama ? Math.min((targetUtama.current_amount / (targetUtama.target_amount || 1)) * 100, 100) : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Target</p>
                        <p className="text-xs font-black text-slate-600">{isPrivacyMode ? 'Rp •••' : `Rp ${targetUtama?.target_amount?.toLocaleString('id-ID') || '0'}`}</p>
                    </div>
                    {perMonth > 0 && (
                        <div>
                            <p className="text-[9px] font-bold text-indigo-400 uppercase">Per Bulan</p>
                            <p className="text-xs font-black text-indigo-600">{isPrivacyMode ? 'Rp •••' : `Rp ${Math.round(perMonth).toLocaleString('id-ID')}`}</p>
                        </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm aspect-[1.1/1] flex flex-col justify-between overflow-hidden">
                  <HealthScore 
                    targets={targets} 
                    transactions={transactions} 
                    monthlyBudget={monthlyBudget} 
                    expenses={expenses} 
                    isCompact={true} 
                  />
               </div>

               <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm aspect-[1.1/1] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Budget</span>
                  </div>
                  {monthlyBudgetProgress ? (
                    <div>
                        <p className="text-lg font-black text-slate-800">{monthlyBudgetProgress.percent.toFixed(0)}%</p>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden mt-1 mb-2">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${monthlyBudgetProgress.percent}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold">Terpakai dari Rp {isPrivacyMode ? '•••' : monthlyBudgetProgress.target.toLocaleString('id-ID')}</p>
                    </div>
                  ) : (
                    <button onClick={() => router.push('/pengaturan')} className="text-[10px] font-bold text-blue-500 underline flex-1 flex items-center justify-center">Set Budget</button>
                  )}
               </div>
            </div>

            {/* Monthly Summary */}
            <MonthlySummary transactions={transactions} isPrivacyMode={isPrivacyMode} />

            {/* Activity Area */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Aktivitas Menabung</h3>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <SavingsHeatmap transactions={transactions} compact={true} />
            </div>

            {/* Compact Target List */}
            {(targets && targets.length > 0) && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-black text-slate-800 tracking-tight">Rincian Tabungan</h3>
                        <button onClick={() => router.push('/target')} className="text-xs font-bold text-indigo-500 px-3 py-1 bg-indigo-50 rounded-full">Lihat Semua</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {targets.slice(0, 3).map(t => (
                            <div key={t.id} onClick={() => router.push('/target')} className="bg-white rounded-2xl p-4 border border-slate-50 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Target className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{t.name}</p>
                                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (t.current_amount / (t.target_amount || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <p className="text-xs font-black text-slate-800">{isPrivacyMode ? 'Rp •••' : `Rp ${t.current_amount.toLocaleString('id-ID')}`}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{Math.round((t.current_amount / (t.target_amount || 1)) * 100)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </div>

      <MonthlyDigest 
        isOpen={showDigest} 
        onClose={() => setShowDigest(false)} 
        targets={targets}
        transactions={transactions}
        expenses={expenses}
        isPrivacyMode={isPrivacyMode}
      />
    </main>
  );
}
