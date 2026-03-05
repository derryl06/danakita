'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { FileText, Download, Share2, TrendingUp, PieChart, History, ChevronLeft, FileSpreadsheet, Building2, Gem, Wallet, LineChart } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useRouter } from 'next/navigation';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanPage() {
    const { targets, transactions, isPrivacyMode } = useAppContext();
    const router = useRouter();

    const totalTarget = targets.reduce((acc, t) => acc + (Number(t.target_amount) || 0), 0);
    const totalCurrent = targets.reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);
    const progress = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : 0;

    const handleBack = () => {
        router.back();
    };

    const assetData = [
        { name: 'Bank', icon: <Building2 className="w-4 h-4" />, colorHex: '#4f46e5' },   // indigo-600
        { name: 'Emas', icon: <Gem className="w-4 h-4" />, colorHex: '#d97706' },        // amber-600
        { name: 'Tunai', icon: <Wallet className="w-4 h-4" />, colorHex: '#059669' },    // emerald-600
        { name: 'Reksadana', icon: <LineChart className="w-4 h-4" />, colorHex: '#0284c7' }, // sky-600
    ].map(loc => {
        const amount = targets
            .filter(t => (t.storage_location || 'Bank') === loc.name)
            .reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);
        return { ...loc, amount, percentage: totalCurrent > 0 ? (amount / totalCurrent) * 100 : 0 };
    });

    let currentDeg = 0;
    const gradientStops = assetData.map(d => {
        if (d.percentage === 0) return '';
        const start = currentDeg;
        currentDeg += (d.percentage / 100) * 360;
        return `${d.colorHex} ${start}deg ${currentDeg}deg`;
    }).filter(g => g).join(', ');

    const conicGradientString = gradientStops ? `conic-gradient(${gradientStops})` : 'conic-gradient(#f1f5f9 0deg 360deg)';

    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
            date: d,
            label: format(d, 'MMM', { locale: id }), // Jan, Feb, dst
            in: 0,
            out: 0
        };
    });

    transactions?.forEach(trx => {
        if (!trx.date) return;
        const trxDate = typeof trx.date === 'string' ? parseISO(trx.date) : new Date(trx.date);

        const monthMatch = last6Months.find(m => isSameMonth(m.date, trxDate));
        if (monthMatch) {
            if (trx.type === 'in') monthMatch.in += Number(trx.amount) || 0;
            if (trx.type === 'out') monthMatch.out += Number(trx.amount) || 0;
        }
    });

    const maxChartValue = Math.max(...last6Months.map(m => Math.max(m.in, m.out)), 1000);


    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] overflow-x-hidden">
            <TopBar
                title="Laporan & Ekspor"
                rightComponent={
                    <button onClick={handleBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col gap-6">

                {/* Dashboard Preview Section */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Keuangan</span>
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 mb-1">
                            {progress}% <span className="text-sm font-bold text-emerald-500 ml-1">Tercapai</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mb-6">Dari total target {isPrivacyMode ? 'Rp •••••••' : `Rp ${totalTarget.toLocaleString('id-ID')}`}</p>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Saldo</span>
                                <span className="text-sm font-black text-slate-700">{isPrivacyMode ? 'Rp •••••••' : `Rp ${totalCurrent.toLocaleString('id-ID')}`}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Target</span>
                                <span className="text-sm font-black text-slate-700">{isPrivacyMode ? 'Rp •••••••' : `Rp ${totalTarget.toLocaleString('id-ID')}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Allocation Summary */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-wider">Sebaran Aset</h3>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                        {/* Donut Chart */}
                        <div className="relative w-[120px] h-[120px] flex-shrink-0 z-10">
                            <div
                                className="absolute inset-0 rounded-full shadow-lg transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-12"
                                style={{ background: conicGradientString }}
                            ></div>
                            <div className="absolute inset-[18px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Aset</span>
                                <span className="text-sm font-black text-slate-800">
                                    {isPrivacyMode ? '•••' : (totalCurrent >= 1000000 ? `${(totalCurrent / 1000000).toFixed(1)}Jt` : `${(totalCurrent / 1000).toFixed(0)}Rb`)}
                                </span>
                            </div>
                        </div>

                        {/* Legends */}
                        <div className="flex-1 flex flex-col gap-3.5 z-10">
                            {assetData.map(d => (
                                <div key={d.name} className="flex justify-between items-center group/legend">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full shadow-sm group-hover/legend:scale-125 transition-transform" style={{ backgroundColor: d.colorHex }}></div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover/legend:text-slate-800 transition-colors">{d.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 group-hover/legend:border-slate-300 transition-colors">
                                        {isPrivacyMode ? '••%' : `${d.percentage.toFixed(0)}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trend Chart */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-wider">Tren Aktivitas (6 Bulan)</h3>
                    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex items-end justify-between h-40 gap-1.5 mb-5 mt-4 px-2">
                            {last6Months.map((m, i) => {
                                const heightIn = (m.in / maxChartValue) * 100;
                                const heightOut = (m.out / maxChartValue) * 100;

                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 gap-2.5 group/bar z-10">
                                        <div className="w-full flex justify-center gap-1 h-32 items-end relative">
                                            {/* Bar Masuk */}
                                            <div
                                                className="w-full max-w-[12px] bg-indigo-500 rounded-t-md relative transition-all duration-700 ease-out group-hover/bar:bg-indigo-600 shadow-sm"
                                                style={{ height: `${Math.max(heightIn, 3)}%` }} // min height for visibility
                                            >
                                                <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2.5 py-1.5 rounded-lg flex items-center shadow-lg transition-opacity whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-800 font-bold tracking-wider">
                                                    Masuk: {isPrivacyMode ? '•••' : (m.in >= 1000000 ? `${(m.in / 1000000).toFixed(1)}Jt` : `${Math.round(m.in / 1000)}Rb`)}
                                                </div>
                                            </div>
                                            {/* Bar Keluar */}
                                            <div
                                                className="w-full max-w-[12px] bg-rose-300 rounded-t-lg relative transition-all duration-700 ease-out group-hover/bar:bg-rose-400"
                                                style={{ height: `${Math.max(heightOut, 1)}%` }}
                                            >
                                                <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2.5 py-1.5 rounded-lg flex items-center shadow-lg transition-opacity whitespace-nowrap z-40 pointer-events-none before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-800 font-bold tracking-wider">
                                                    Keluar: {isPrivacyMode ? '•••' : (m.out >= 1000000 ? `${(m.out / 1000000).toFixed(1)}Jt` : `${Math.round(m.out / 1000)}Rb`)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 border-t border-slate-100 pt-5 pb-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span> Menabung
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span> Pengeluaran
                            </div>
                        </div>
                    </div>
                </section>

                {/* Export Options */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-wider">Format Ekspor</h3>
                    <div className="grid grid-cols-1 gap-4">

                        <button
                            onClick={() => exportToPDF(targets, transactions)}
                            className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group active:scale-95"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl group-hover:bg-rose-100 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-700">Dokumen PDF</h4>
                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">Cetak laporan cantik & rapi</p>
                                </div>
                            </div>
                            <Download className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </button>

                        <button
                            onClick={() => exportToExcel(targets, transactions)}
                            className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group active:scale-95"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-700">Data Excel (.xlsx)</h4>
                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">Untuk diolah di spreadsheet</p>
                                </div>
                            </div>
                            <Download className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </button>

                    </div>
                </section>

                {/* Info Card */}
                <div className="bg-indigo-600 rounded-[24px] p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Share2 className="w-20 h-20" />
                    </div>
                    <h4 className="font-bold mb-1">Siap untuk Berbagi?</h4>
                    <p className="text-[11px] text-indigo-100 leading-relaxed mb-4">
                        Gunakan laporan PDF untuk memantau progress bersama pasangan atau keluarga secara profesional.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full">
                        <PieChart className="w-3 h-3" />
                        CLOUDSYNC AKTIF
                    </div>
                </div>

                <div className="mt-auto pt-6 flex flex-col items-center gap-2 opacity-30 select-none">
                    <History className="w-8 h-8 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arsip Dana Kita v1.0</span>
                </div>

            </div>
        </main>
    );
}
