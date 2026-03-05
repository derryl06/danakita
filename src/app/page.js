'use client';

import { useAppContext } from '../context/AppContext';
import { useQuickAdd } from '../context/QuickAddContext';
import TopBar from '../components/TopBar';
import GoalCard from '../components/GoalCard';
import { differenceInMonths, parseISO, isValid, subDays, isSameDay, format, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowRight, Sparkles, Calendar, Eye, EyeOff, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function Beranda() {
  const { targets, transactions, isDemoMode, loadDemoData, clearData, deleteTarget, isPrivacyMode, togglePrivacyMode } = useAppContext();
  const { setIsOpen } = useQuickAdd();
  const router = useRouter();

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

    // If deadline is in the future but less than 1 month, treat as 1 month to avoid Infinity
    const effectiveSisaBulan = sisaBulan <= 0 ? 0 : sisaBulan;

    const sisaTarget = targetUtama.target_amount - targetUtama.current_amount;
    if (sisaTarget <= 0) return { perMonth: 0, status: 'Tercapai 🎉', type: 'success' };

    if (effectiveSisaBulan <= 0) return { perMonth: 0, status: 'Deadline berlalu', type: 'warning' };

    const butuhPerBulan = sisaTarget / effectiveSisaBulan;

    return { perMonth: butuhPerBulan, status: 'On track', type: 'success' };
  }, [targetUtama]);

  const activityMap = useMemo(() => {
    const daysCount = 28; // 4 Minggu terakhir
    const today = startOfDay(new Date());
    const tracking = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const isDayMatch = (trx) => {
        if (!trx.date) return false;
        const tDate = typeof trx.date === 'string' ? parseISO(trx.date) : new Date(trx.date);
        return isSameDay(tDate, date);
      };

      const dayTransactions = transactions?.filter(t => t.type === 'in' && isDayMatch(t)) || [];
      const totalIn = dayTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      let intensity = 0;
      if (totalIn > 0) {
        if (totalIn >= 500000) intensity = 3;
        else if (totalIn >= 100000) intensity = 2;
        else intensity = 1;
      }

      tracking.push({
        date,
        totalIn,
        intensity,
        label: format(date, 'd MMM', { locale: id })
      });
    }

    return tracking;
  }, [transactions]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    // Loop dari hari ini ke belakang
    for (let i = activityMap.length - 1; i >= 0; i--) {
      if (activityMap[i].intensity > 0) {
        streak++;
      } else if (i !== activityMap.length - 1) {
        // Kalau bolong selain hari ini, stop.
        break;
      }
    }
    return streak;
  }, [activityMap]);

  return (
    <main className="flex-1 flex flex-col min-h-screen pb-24">
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

        {targets.length === 0 ? (
          // EMPTY STATE
          <div className="flex flex-col mt-4 mb-auto pt-4">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">Hero Target Utama</h2>

            <div className="bg-white/80 backdrop-blur-md border border-[var(--color-border)] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/50 z-0"></div>

              <div className="z-10 w-full mb-3 flex justify-between items-center">
                <span className="font-semibold text-slate-500">Dana Utama</span>
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-medium">Belum disetel</span>
              </div>

              <h1 className="z-10 text-4xl font-extrabold text-[var(--color-text-primary)] mb-6 tracking-tight">Rp 0</h1>

              <div className="z-10 w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6"></div>

              <div className="z-10 text-xs text-slate-500 text-center w-full bg-slate-50 rounded-lg py-2 border border-dashed border-slate-200 mb-8">
                Belum ada target • Belum ada deadline
              </div>

              <div className="z-10 w-full flex flex-col gap-3 mt-4">
                <button
                  onClick={() => router.push('/target')}
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white py-4 rounded-[16px] font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Setel Target Tabungan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={loadDemoData}
                  className="w-full bg-slate-50 text-[var(--color-text-primary)] border border-slate-200 py-3.5 rounded-[16px] font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Coba dengan contoh data <Sparkles className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // NORMAL STATE
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Target Utama</h2>
                <div onClick={() => router.push('/simulasi')} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  CEK ESTIMASI WAKTU
                </div>
              </div>

              <div className="bg-white border rounded-[32px] p-6 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.1)] border-blue-100 relative overflow-hidden group hover:shadow-[0_15px_50px_-10px_rgba(37,99,235,0.15)] transition-all duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-indigo-100/10 rounded-full blur-3xl -mr-24 -mt-16 z-0 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/30 rounded-full blur-2xl -ml-16 -mb-16 z-0"></div>

                <div className="z-10 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">{targetUtama.name}</span>
                      <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight mt-1">
                        {isPrivacyMode ? 'Rp •••••••' : `Rp ${targetUtama.current_amount?.toLocaleString('id-ID') || '0'}`}
                      </h1>
                    </div>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-wider uppercase ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xs font-bold text-slate-400">
                      Target: {isPrivacyMode ? 'Rp •••••••' : `Rp ${targetUtama.target_amount?.toLocaleString('id-ID') || '0'}`}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100/50 rounded-full overflow-hidden mb-6 shadow-inner backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${Math.min((targetUtama.current_amount / targetUtama.target_amount) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50/80 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-sm">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Sisa Waktu</span>
                      <span className="text-xs font-black text-slate-700">{targetUtama.deadline && isValid(parseISO(targetUtama.deadline)) ? differenceInMonths(parseISO(targetUtama.deadline), new Date()) + ' Bulan Lagi' : 'Belum Set'}</span>
                    </div>
                    {perMonth > 0 && (
                      <div className="bg-blue-50/50 backdrop-blur-md p-3 rounded-2xl border border-blue-100/50 shadow-sm">
                        <span className="block text-[9px] font-bold text-blue-400 uppercase mb-0.5">Nabung / bln</span>
                        <span className="text-xs font-black text-blue-700">{isPrivacyMode ? 'Rp •••••••' : `Rp ${Math.round(perMonth).toLocaleString('id-ID')}`}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    Tambah Tabungan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* HABIT TRACKER */}
            {targets.length > 0 && (
              <div className="mt-8 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Flame className={currentStreak > 0 ? "text-amber-500 w-4 h-4" : "text-slate-400 w-4 h-4"} />
                    Konsistensi Nabung
                  </h3>
                  {currentStreak > 0 && (
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{currentStreak} Hari Beruntun🔥</span>
                  )}
                </div>

                <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {activityMap.map((day, idx) => {
                      let bgClass = "bg-slate-50 border border-slate-100";
                      if (day.intensity === 1) bgClass = "bg-emerald-200 border !border-emerald-300 shadow-[0_0_10px_rgba(167,243,208,0.5)]";
                      if (day.intensity === 2) bgClass = "bg-emerald-400 border !border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.6)]";
                      if (day.intensity === 3) bgClass = "bg-emerald-600 border !border-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.7)]";

                      return (
                        <div
                          key={idx}
                          title={`${day.label}: ${day.intensity > 0 ? (isPrivacyMode ? 'Rp •••••••' : `+Rp ${day.totalIn.toLocaleString('id-ID')}`) : 'Belum menabung'}`}
                          className={`aspect-square rounded-[8px] transition-all duration-500 hover:scale-110 cursor-pointer ${bgClass}`}
                        ></div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">28 Hari Terakhir</span>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 tracking-wider">
                      <span>KOSONG</span>
                      <div className="flex gap-1 ml-1 mr-1">
                        <div className="w-2.5 h-2.5 rounded-[3px] bg-slate-50 border border-slate-200"></div>
                        <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-200 border border-emerald-300"></div>
                        <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-400 border border-emerald-500"></div>
                        <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600 border border-emerald-700"></div>
                      </div>
                      <span>RUTIN</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {targets.length > 1 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">Rincian Target</h3>
                  <button onClick={() => router.push('/target')} className="text-sm font-semibold text-[var(--color-primary)]">Lihat semua</button>
                </div>

                <div className="flex flex-col gap-3">
                  {targets.map(t => (
                    <GoalCard
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      category={t.category}
                      currentAmount={t.current_amount}
                      targetAmount={t.target_amount}
                      isInflationAdjusted={t.is_inflation_adjusted}
                      originalTargetAmount={t.original_target_amount}
                      storageLocation={t.storage_location}
                      onDelete={deleteTarget}
                      onEdit={(id) => router.push('/target')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
