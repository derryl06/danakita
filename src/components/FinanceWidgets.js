'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Gem, Building2, Wallet, LineChart, Calculator, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GoldPriceWidget() {
    const [goldPrices, setGoldPrices] = useState({
        sell: 3039000,
        buyback: 2818000,
        change: 0.25,
        lastUpdate: new Date().toLocaleDateString('id-ID')
    });

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

    return (
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
            <p className="text-[8px] text-amber-600/60 font-medium mt-3 italic tracking-tight">*Simulasi harga LM Antam</p>
        </div>
    );
}

export function SimulationWidget() {
    const router = useRouter();

    return (
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
    );
}
