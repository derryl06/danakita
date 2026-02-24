'use client';

import { useAppContext } from '../context/AppContext';
import { useQuickAdd } from '../context/QuickAddContext';
import TopBar from '../components/TopBar';
import GoalCard from '../components/GoalCard';
import { differenceInMonths, parseISO, isValid } from 'date-fns';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Beranda() {
  const { targets, isDemoMode, loadDemoData, clearData } = useAppContext();
  const { setIsOpen } = useQuickAdd();
  const router = useRouter();

  const calculateTargetUtama = () => {
    if (targets.length === 0) return null;
    const totalTarget = targets.reduce((acc, t) => acc + (t.target_amount || 0), 0);
    const totalCurrent = targets.reduce((acc, t) => acc + (t.current_amount || 0), 0);

    // Temukan deadline terjauh untuk target utama
    const validDeadlines = targets
      .filter(t => t.deadline)
      .map(t => parseISO(t.deadline))
      .filter(d => isValid(d));
    const furthestDeadline = validDeadlines.length > 0 ? new Date(Math.max(...validDeadlines)) : null;

    return {
      id: 'main',
      name: 'Dana Keseluruhan',
      target_amount: totalTarget,
      current_amount: totalCurrent,
      deadline: furthestDeadline ? furthestDeadline.toISOString() : null
    };
  };

  const targetUtama = calculateTargetUtama();

  const calculatePerMonthAndStatus = (target) => {
    if (!target || !target.deadline || target.target_amount <= 0) return { perMonth: 0, status: 'Belum disetel', type: 'neutral' };

    const parsedDate = parseISO(target.deadline);
    if (!isValid(parsedDate)) return { perMonth: 0, status: 'Belum disetel', type: 'neutral' };

    const sisaBulan = differenceInMonths(parsedDate, new Date());
    if (sisaBulan <= 0) return { perMonth: 0, status: 'Deadline berlalu', type: 'warning' };

    const sisaTarget = target.target_amount - target.current_amount;
    if (sisaTarget <= 0) return { perMonth: 0, status: 'Tercapai 🎉', type: 'success' };

    const butuhPerBulan = sisaTarget / sisaBulan;

    return { perMonth: butuhPerBulan, status: 'On track', type: 'success' };
  };

  const { perMonth, status, type } = calculatePerMonthAndStatus(targetUtama);

  return (
    <main className="flex-1 flex flex-col min-h-screen pb-24">
      <TopBar
        title="SiapDana"
        subtitle="Mulai persiapkan masa depanmu"
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
              <h2 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Target Utama</h2>

              <div className="bg-white border rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-[var(--color-primary)]/20 relative overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-0.5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-16 -mt-16 z-0"></div>

                <div className="z-10 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-600 text-sm">{targetUtama.name}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-end gap-2 mb-4">
                    <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                      Rp {targetUtama.current_amount?.toLocaleString('id-ID') || '0'}
                    </h1>
                    <span className="text-sm font-semibold text-slate-400 mb-1.5">
                      / Rp {targetUtama.target_amount?.toLocaleString('id-ID') || '0'}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-blue-400 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${Math.min((targetUtama.current_amount / targetUtama.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400">Target Waktu Terlama</span>
                      <span className="text-slate-700">{targetUtama.deadline && isValid(parseISO(targetUtama.deadline)) ? differenceInMonths(parseISO(targetUtama.deadline), new Date()) + ' bulan lagi' : 'Belum disetel'}</span>
                    </div>
                    {perMonth > 0 && (
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-slate-400">Butuh</span>
                        <span className="text-blue-600">Rp {Math.round(perMonth).toLocaleString('id-ID')} / bln</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white py-3.5 rounded-[16px] font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Tambah tabungan
                  </button>
                </div>
              </div>
            </div>

            {targets.length > 1 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">Rincian Target</h3>
                  <button onClick={() => router.push('/target')} className="text-sm font-semibold text-[var(--color-primary)]">Lihat semua</button>
                </div>

                <div className="flex flex-col gap-3">
                  {targets.map(t => (
                    <div key={t.id} className="bg-white border border-[var(--color-border)] p-4 rounded-[20px] flex justify-between items-center shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 transition-all duration-300 cursor-pointer group">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <h4 className="font-semibold text-sm">{t.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                            {t.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--color-primary)]">Rp {t.current_amount.toLocaleString('id-ID')}</span>
                          <span className="text-xs text-slate-400">/ Rp {t.target_amount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg">
                          {Math.round((t.current_amount / t.target_amount) * 100)}%
                        </span>
                      </div>
                    </div>
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
