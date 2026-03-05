'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { FileText, Download, Share2, TrendingUp, PieChart, History, ChevronLeft, FileSpreadsheet, Building2, Gem, Wallet, LineChart } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useRouter } from 'next/navigation';

export default function LaporanPage() {
    const { targets, transactions } = useAppContext();
    const router = useRouter();

    const totalTarget = targets.reduce((acc, t) => acc + (Number(t.target_amount) || 0), 0);
    const totalCurrent = targets.reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);
    const progress = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : 0;

    const handleBack = () => {
        router.back();
    };

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
                        <p className="text-xs text-slate-400 font-medium mb-6">Dari total target Rp {totalTarget.toLocaleString('id-ID')}</p>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Saldo</span>
                                <span className="text-sm font-black text-slate-700">Rp {totalCurrent.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Target</span>
                                <span className="text-sm font-black text-slate-700">Rp {totalTarget.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Allocation Summary */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-wider">Sebaran Aset</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: 'Bank', icon: <Building2 className="w-4 h-4" />, color: 'blue' },
                            { name: 'Emas', icon: <Gem className="w-4 h-4" />, color: 'amber' },
                            { name: 'Tunai', icon: <Wallet className="w-4 h-4" />, color: 'emerald' },
                            { name: 'Reksadana', icon: <LineChart className="w-4 h-4" />, color: 'indigo' },
                        ].map(loc => {
                            const amount = targets
                                .filter(t => (t.storage_location || 'Bank') === loc.name)
                                .reduce((acc, t) => acc + (Number(t.current_amount) || 0), 0);

                            return (
                                <div key={loc.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-${loc.color}-50 text-${loc.color}-600`}>
                                        {loc.icon}
                                    </div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{loc.name}</span>
                                    <span className="text-xs font-black text-slate-700">Rp {amount.toLocaleString('id-ID')}</span>
                                </div>
                            );
                        })}
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
