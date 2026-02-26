'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { Calculator, Calendar, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SimulasiPage() {
    const { targets } = useAppContext();
    const [totalTarget, setTotalTarget] = useState(0);
    const [tabunganSekarang, setTabunganSekarang] = useState(0);
    const [tabunganPerBulan, setTabunganPerBulan] = useState(1000000);

    useEffect(() => {
        if (targets.length > 0) {
            const tt = targets.reduce((acc, t) => acc + (t.target_amount || 0), 0);
            const tc = targets.reduce((acc, t) => acc + (t.current_amount || 0), 0);
            setTotalTarget(tt);
            setTabunganSekarang(tc);
        }
    }, [targets]);

    const sisaTarget = totalTarget - tabunganSekarang;
    const sisaBulan = sisaTarget > 0 && tabunganPerBulan > 0 ? Math.ceil(sisaTarget / tabunganPerBulan) : 0;
    const estimasiTanggal = addMonths(new Date(), sisaBulan);

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-white">
            <TopBar title="Kapan Target Tercapai?" subtitle="Hitung estimasi berdasarkan finansialmu" />

            <div className="px-5 mt-6 flex flex-col gap-6">

                <div className="bg-blue-600 text-white rounded-[32px] p-8 shadow-xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10 text-center">
                        <p className="text-blue-100 text-sm font-medium mb-1">Estimasi Kamu Siap:</p>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">
                            {sisaBulan > 0 ? `${sisaBulan} Bulan Lagi` : 'Sudah Siap!'}
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-blue-700/50 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-400/30">
                            <Calendar className="w-4 h-4" />
                            {format(estimasiTanggal, 'MMMM yyyy', { locale: id })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[24px]">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Parameter Keuangan</label>

                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-slate-400" /> Total Kebutuhan
                                    </span>
                                    <span className="text-sm font-extrabold text-blue-600">Rp {totalTarget.toLocaleString('id-ID')}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1000000"
                                    max="500000000"
                                    step="1000000"
                                    value={totalTarget}
                                    onChange={(e) => setTotalTarget(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400" /> Tabungan Sekarang
                                    </span>
                                    <span className="text-sm font-extrabold text-slate-900">Rp {tabunganSekarang.toLocaleString('id-ID')}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={totalTarget}
                                    step="500000"
                                    value={tabunganSekarang}
                                    onChange={(e) => setTabunganSekarang(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-800">Kemampuan Nabung / bln</span>
                                    <span className="text-lg font-black text-emerald-600">Rp {tabunganPerBulan.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[500000, 1000000, 2500000, 5000000].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setTabunganPerBulan(val)}
                                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tabunganPerBulan === val ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                                        >
                                            {val / 1000}rb
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={tabunganPerBulan}
                                    onChange={(e) => setTabunganPerBulan(Number(e.target.value))}
                                    placeholder="Atau masukkan manual..."
                                    className="w-full mt-3 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-[24px]">
                        <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" /> Tips Percepatan
                        </h4>
                        <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                            Jika kamu menambah tabungan sebesar **Rp 500.000** lagi per bulan, kamu bisa mempercepat targetmu menjadi **{Math.ceil(sisaTarget / (tabunganPerBulan + 500000))} bulan lagi** ({sisaBulan - Math.ceil(sisaTarget / (tabunganPerBulan + 500000))} bulan lebih cepat!).
                        </p>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        Selesai Mensimulasi
                    </button>
                </div>

            </div>
        </main>
    );
}
