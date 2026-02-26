'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { CheckCircle2, Circle, Users, TrendingUp, Calculator, Share2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PersiapanPage() {
    const { checklist, toggleChecklist, partner, connectPartner } = useAppContext();
    const [goldPrices, setGoldPrices] = useState({
        sell: 3039000,
        buyback: 2818000,
        change: 0.25
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [partnerName, setPartnerName] = useState('');
    const router = useRouter();

    // Simulating gold price update based on Antam reference
    useEffect(() => {
        const interval = setInterval(() => {
            setGoldPrices(prev => ({
                ...prev,
                sell: prev.sell + (Math.random() > 0.5 ? 1000 : -1000),
                buyback: prev.buyback + (Math.random() > 0.5 ? 800 : -800),
                change: (Math.random() * 2 - 1).toFixed(2)
            }));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = (e) => {
        e.preventDefault();
        if (partnerName.trim()) {
            connectPartner(partnerName);
            setIsConnecting(false);
        }
    };

    const doneCount = checklist.filter(i => i.done).length;
    const progress = (doneCount / checklist.length) * 100;

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-slate-50">
            <TopBar title="Checklist & Fitur" subtitle="Kelola detail target masa depanmu" />

            <div className="px-5 mt-6 flex flex-col gap-6">

                {/* Checkbox Persiapan */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Checklist Target</h2>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {doneCount}/{checklist.length}
                        </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {checklist.map(item => (
                            <div
                                key={item.id}
                                onClick={() => toggleChecklist(item.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}
                            >
                                {item.done ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300" />
                                )}
                                <div className="flex flex-col">
                                    <span className={`text-sm font-semibold ${item.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                                        {item.task}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Tools Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Harga Emas Antam */}
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-[24px] p-5 border border-amber-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-16 h-16 text-amber-600" />
                        </div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Emas Antam</h3>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${goldPrices.change >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {goldPrices.change >= 0 ? '▲' : '▼'} {Math.abs(goldPrices.change)}%
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 relative z-10">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 leading-none">HARGA BELI</p>
                                <p className="text-base font-black text-slate-800 tracking-tight">
                                    Rp {goldPrices.sell.toLocaleString('id-ID')} <span className="text-[10px] font-bold text-slate-400">/ gr</span>
                                </p>
                            </div>
                            <div className="pt-2 border-t border-amber-100/50">
                                <p className="text-[9px] font-bold text-slate-400 leading-none">BUYBACK</p>
                                <p className="text-sm font-extrabold text-amber-700 tracking-tight">
                                    Rp {goldPrices.buyback.toLocaleString('id-ID')} <span className="text-[9px] font-medium text-amber-600/60">/ gr</span>
                                </p>
                            </div>
                        </div>
                        <p className="text-[8px] text-amber-600/60 font-medium mt-3 italic tracking-tight">*Referensi harga LM Antam hari ini</p>
                    </div>

                    {/* Kalkulator Simulasi */}
                    <button
                        onClick={() => router.push('/simulasi')}
                        className="bg-gradient-to-br from-blue-50 to-white rounded-[24px] p-5 border border-blue-100 shadow-sm text-left relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Calculator className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-tight">Simulasi</h3>
                        <p className="text-lg font-extrabold text-slate-800 tracking-tight">Kapan Target?</p>
                        <p className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">Hitung Target <ExternalLink className="w-2.5 h-2.5" /></p>
                    </button>
                </div>

                {/* Partner Sync Section */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-50 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Koneksi Pasangan</h2>
                    </div>

                    {partner ? (
                        <div className="flex flex-col gap-4">
                            <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-5 rounded-3xl border border-rose-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-rose-200 shadow-sm font-black text-rose-500 text-xl rotate-3">
                                        {partner.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-rose-900">Partner: {partner.name}</p>
                                        <p className="text-[10px] text-rose-600 font-medium">Tersambung sejak {new Date(partner.connectedAt).toLocaleDateString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-white/70 backdrop-blur-md rounded-xl text-rose-400 shadow-sm border border-white">
                                    <Share2 className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Joint Progress Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Bersama</p>
                                    <p className="text-lg font-black text-slate-800">{targets.length} <span className="text-[10px] font-bold text-slate-400">DANA</span></p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Checklist Selesai</p>
                                    <p className="text-lg font-black text-rose-500">{checklist.filter(i => i.done).length} / {checklist.length}</p>
                                </div>
                            </div>

                            <div className="bg-rose-50/30 border border-rose-100/50 p-4 rounded-2xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-rose-600 uppercase">Kontribusi Progres</span>
                                    <span className="text-[10px] font-bold text-rose-600">{Math.round(progress)}% Total</span>
                                </div>
                                <div className="w-full h-3 bg-white rounded-full overflow-hidden flex border border-rose-100 p-0.5">
                                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${progress * 0.6}%` }}></div>
                                    <div className="h-full bg-orange-300 rounded-full ml-0.5" style={{ width: `${progress * 0.4}%` }}></div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                                        <span className="text-[8px] font-bold text-slate-500">Kamu</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                                        <span className="text-[8px] font-bold text-slate-500">{partner.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : isConnecting ? (
                        <form onSubmit={handleConnect} className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={partnerName}
                                onChange={e => setPartnerName(e.target.value)}
                                placeholder="Masukkan nama pasangan..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-rose-200"
                                >
                                    Hubungkan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsConnecting(false)}
                                    className="px-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-sm"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-500 mb-4 px-6 italic">Bagikan progres tabungan dan checklist target langsung dengan pasanganmu.</p>
                            <button
                                onClick={() => setIsConnecting(true)}
                                className="bg-rose-50 text-rose-600 px-6 py-2.5 rounded-full font-bold text-xs border border-rose-100 hover:bg-rose-100 transition-all"
                            >
                                Sambungkan Sekarang
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-slate-900 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Laporan Bulanan
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Tabunganmu tumbuh 15% lebih cepat bulan ini. Terus semangat!</p>

                        <button
                            onClick={() => alert('Fitur Export PDF sedang disiapkan!')}
                            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            <Share2 className="w-4 h-4" /> Download Laporan Progress
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
