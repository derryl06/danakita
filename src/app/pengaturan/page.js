'use client';

import { useState } from 'react';
import TopBar from '../../components/TopBar';
import {
    Settings2, Bell, Shield, Palette, DollarSign, Wallet2, Moon, Eye,
    ChevronRight, Check, Sliders, BellRing, AlertTriangle, ChevronLeft
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { EXPENSE_CATEGORIES } from '../pengeluaran/page';
import { useRouter } from 'next/navigation';

export default function PengaturanPage() {
    const router = useRouter();
    const {
        isDarkMode, toggleDarkMode,
        isPrivacyMode, togglePrivacyMode,
        monthlyBudget, updateMonthlyBudget,
        expenseBudgets, updateExpenseBudget,
    } = useAppContext();
    const { addToast } = useToast();

    const [budgetInput, setBudgetInput] = useState(
        monthlyBudget > 0 ? monthlyBudget.toLocaleString('id-ID') : ''
    );
    const [catBudgets, setCatBudgets] = useState(() => {
        const init = {};
        EXPENSE_CATEGORIES.forEach(c => {
            init[c.id] = expenseBudgets?.[c.id] > 0 ? Number(expenseBudgets[c.id]).toLocaleString('id-ID') : '';
        });
        return init;
    });
    const [savedBudget, setSavedBudget] = useState(false);
    const [savedCat, setSavedCat] = useState(false);

    const handleSaveBudget = () => {
        const val = parseInt(budgetInput.replace(/\D/g, '') || '0', 10);
        updateMonthlyBudget(val);
        setSavedBudget(true);
        addToast('Budget bulanan disimpan ✅', 'success');
        setTimeout(() => setSavedBudget(false), 2000);
    };

    const handleSaveCatBudgets = () => {
        EXPENSE_CATEGORIES.forEach(c => {
            const val = parseInt((catBudgets[c.id] || '').replace(/\D/g, '') || '0', 10);
            updateExpenseBudget(c.id, val);
        });
        setSavedCat(true);
        addToast('Budget kategori disimpan ✅', 'success');
        setTimeout(() => setSavedCat(false), 2000);
    };

    const Section = ({ title, children }) => (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-2 border-b border-slate-50">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h2>
            </div>
            <div className="divide-y divide-slate-50">{children}</div>
        </div>
    );

    const Toggle = ({ icon: Icon, label, sub, checked, onChange, color = 'blue' }) => (
        <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center bg-${color}-50`}>
                    <Icon className={`w-4.5 h-4.5 text-${color}-500`} style={{ width: 18, height: 18 }} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-700">{label}</p>
                    {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked ? (color === 'indigo' ? 'bg-indigo-500' : (color === 'slate' ? 'bg-slate-800' : 'bg-blue-500')) : 'bg-slate-200'}`}
            >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-6' : 'left-0.5'}`} />
            </button>
        </div>
    );

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] page-transition">
            <TopBar 
                title="Pengaturan" 
                subtitle="Preferensi & konfigurasi app" 
                rightComponent={
                    <button onClick={() => router.back()} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex flex-col gap-5">

                {/* Tampilan */}
                <Section title="Tampilan">
                    <Toggle
                        icon={Moon}
                        label="Dark Mode"
                        sub="Tampilan gelap untuk mata nyaman"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        color="slate"
                    />
                    <Toggle
                        icon={Eye}
                        label="Mode Privasi"
                        sub="Sembunyikan angka-angka sensitif"
                        checked={isPrivacyMode}
                        onChange={togglePrivacyMode}
                        color="indigo"
                    />
                </Section>

                {/* Budget Bulanan */}
                <Section title="Budget & Keuangan">
                    <div className="px-5 py-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-[14px] flex items-center justify-center bg-orange-50">
                                <Sliders style={{ width: 18, height: 18 }} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Total Budget Bulanan</p>
                                <p className="text-[10px] text-slate-400 font-medium">Batas total pengeluaran per bulan</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                                <input
                                    type="text"
                                    value={budgetInput}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setBudgetInput(v ? parseInt(v).toLocaleString('id-ID') : '');
                                    }}
                                    className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-orange-400 transition-all"
                                    placeholder="Contoh: 3.000.000"
                                />
                            </div>
                            <button
                                onClick={handleSaveBudget}
                                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-1.5 ${savedBudget ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                            >
                                {savedBudget ? <Check style={{ width: 16, height: 16 }} /> : null}
                                {savedBudget ? 'Tersimpan' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Budget Per Kategori */}
                <Section title="Budget per Kategori Pengeluaran">
                    <div className="px-5 py-4 flex flex-col gap-3">
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            Set batas pengeluaran per kategori per bulan. Akan muncul progress bar di halaman Pengeluaran.
                        </p>
                        {EXPENSE_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <div key={cat.id} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                                        <Icon style={{ width: 16, height: 16, color: cat.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold text-slate-500 mb-1">{cat.label}</p>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">Rp</span>
                                            <input
                                                type="text"
                                                value={catBudgets[cat.id] || ''}
                                                onChange={e => {
                                                    const v = e.target.value.replace(/\D/g, '');
                                                    setCatBudgets(prev => ({ ...prev, [cat.id]: v ? parseInt(v).toLocaleString('id-ID') : '' }));
                                                }}
                                                className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
                                                style={{ borderColor: catBudgets[cat.id] ? cat.color + '66' : undefined }}
                                                placeholder="Tidak dibatasi"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            onClick={handleSaveCatBudgets}
                            className={`w-full mt-1 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${savedCat ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                            {savedCat ? <><Check style={{ width: 16, height: 16 }} /> Tersimpan!</> : 'Simpan Budget Kategori'}
                        </button>
                    </div>
                </Section>

                {/* Notifikasi */}
                <Section title="Notifikasi">
                    <div className="px-5 py-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-800">Push Notification</p>
                                <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                                    Aktifkan di pengaturan browser/sistem operasi untuk reminder nabung harian.
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* App Info */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-600">Dana Kita</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Versi 1.1 • Next.js + Firebase</p>
                        </div>
                        <span className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1 rounded-full">Gratis</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
