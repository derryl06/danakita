'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import {
    ShoppingBag, Utensils, Car, Gamepad2, Zap, HeartPulse, GraduationCap,
    Package, Plus, X, Trash2, Search, Filter, ChevronDown, AlertTriangle, TrendingDown
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
    { id: 'Makan', label: 'Makan & Minum', icon: Utensils, color: '#f59e0b', bg: '#fef3c7' },
    { id: 'Transport', label: 'Transportasi', icon: Car, color: '#3b82f6', bg: '#dbeafe' },
    { id: 'Belanja', label: 'Belanja', icon: ShoppingBag, color: '#ec4899', bg: '#fce7f3' },
    { id: 'Hiburan', label: 'Hiburan', icon: Gamepad2, color: '#8b5cf6', bg: '#ede9fe' },
    { id: 'Tagihan', label: 'Tagihan / Utilitas', icon: Zap, color: '#10b981', bg: '#d1fae5' },
    { id: 'Kesehatan', label: 'Kesehatan', icon: HeartPulse, color: '#ef4444', bg: '#fee2e2' },
    { id: 'Pendidikan', label: 'Pendidikan', icon: GraduationCap, color: '#6366f1', bg: '#e0e7ff' },
    { id: 'Lainnya', label: 'Lainnya', icon: Package, color: '#64748b', bg: '#f1f5f9' },
];

export function getCategoryInfo(id) {
    return EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

const QUICK_AMOUNTS = [15000, 25000, 50000, 100000, 200000, 500000];

export default function PengeluaranPage() {
    const { expenses, addExpense, deleteExpense, expenseBudgets, isPrivacyMode } = useAppContext();
    const { addToast } = useToast();

    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [formData, setFormData] = useState({ amount: '', category: 'Makan', note: '', date: new Date().toISOString().slice(0, 10) });
    const [errors, setErrors] = useState({});

    const now = new Date();

    const thisMonthExpenses = useMemo(() => {
        return (expenses || []).filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    }, [expenses]);

    const totalThisMonth = useMemo(() => thisMonthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [thisMonthExpenses]);

    const byCategory = useMemo(() => {
        const result = {};
        EXPENSE_CATEGORIES.forEach(c => { result[c.id] = 0; });
        thisMonthExpenses.forEach(e => {
            if (result[e.category] !== undefined) result[e.category] += Number(e.amount) || 0;
            else result['Lainnya'] += Number(e.amount) || 0;
        });
        return result;
    }, [thisMonthExpenses]);

    const filtered = useMemo(() => {
        let r = [...(expenses || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (filterCat !== 'all') r = r.filter(e => e.category === filterCat);
        if (searchQuery.trim()) r = r.filter(e => (e.note || '').toLowerCase().includes(searchQuery.toLowerCase()));
        return r;
    }, [expenses, filterCat, searchQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amt = parseInt(formData.amount.replace(/\D/g, '') || '0', 10);
        if (amt < 100) { setErrors({ amount: 'Minimal Rp 100' }); return; }
        if (!formData.category) { setErrors({ category: 'Pilih kategori' }); return; }
        setErrors({});
        addExpense({ id: Date.now().toString(), amount: amt, category: formData.category, note: formData.note, date: new Date(formData.date).toISOString() });
        addToast(`Pengeluaran -Rp ${amt.toLocaleString('id-ID')} dicatat 📝`, 'info');
        setIsAdding(false);
        setFormData({ amount: '', category: 'Makan', note: '', date: new Date().toISOString().slice(0, 10) });
    };

    const fmt = (n) => {
        if (isPrivacyMode) return '•••';
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`;
        if (n >= 1000) return `${Math.round(n / 1000)}rb`;
        return n.toLocaleString('id-ID');
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] page-transition">
            <TopBar
                title="Pengeluaran"
                subtitle={`Bulan ini: Rp ${isPrivacyMode ? '•••' : totalThisMonth.toLocaleString('id-ID')}`}
                rightComponent={
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" /> Catat
                    </button>
                }
            />

            <div className="px-5 mt-6 flex flex-col gap-5">

                {/* Monthly Budget Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {EXPENSE_CATEGORIES.slice(0, 4).map(cat => {
                        const spent = byCategory[cat.id] || 0;
                        const budget = expenseBudgets?.[cat.id] || 0;
                        const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
                        const isOver = budget > 0 && spent > budget;
                        const Icon = cat.icon;
                        return (
                            <div key={cat.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bg }}>
                                            <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{cat.id}</span>
                                    </div>
                                    {isOver && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                                </div>
                                <p className="text-sm font-black" style={{ color: isOver ? '#ef4444' : '#1e293b' }}>
                                    Rp {isPrivacyMode ? '•••' : fmt(spent)}
                                </p>
                                {budget > 0 && (
                                    <>
                                        <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isOver ? '#ef4444' : cat.color }} />
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-1">{pct.toFixed(0)}% dari Rp {fmt(budget)}</p>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* By Category Full Bar */}
                <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Kategori Bulan Ini</h3>
                    <div className="flex flex-col gap-3">
                        {EXPENSE_CATEGORIES.map(cat => {
                            const spent = byCategory[cat.id] || 0;
                            if (spent === 0) return null;
                            const pct = totalThisMonth > 0 ? (spent / totalThisMonth) * 100 : 0;
                            const Icon = cat.icon;
                            return (
                                <div key={cat.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                                        <Icon className="w-4 h-4" style={{ color: cat.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[11px] font-bold text-slate-600">{cat.label}</span>
                                            <span className="text-[11px] font-black" style={{ color: cat.color }}>
                                                {isPrivacyMode ? '•••' : `Rp ${spent.toLocaleString('id-ID')}`}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                        {totalThisMonth === 0 && (
                            <div className="text-center py-6 text-slate-400">
                                <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-medium">Belum ada pengeluaran bulan ini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari pengeluaran..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-rose-400 transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={filterCat} onChange={e => setFilterCat(e.target.value)}
                        className="px-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm"
                    >
                        <option value="all">Semua</option>
                        {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                </div>

                {/* Transaction List */}
                <div className="flex flex-col gap-3">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                            <ShoppingBag className="w-10 h-10 text-slate-200 mb-3" />
                            <p className="text-slate-400 font-medium text-sm">Belum ada pengeluaran</p>
                            <button onClick={() => setIsAdding(true)} className="mt-3 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">
                                + Catat Sekarang
                            </button>
                        </div>
                    ) : filtered.map(exp => {
                        const cat = getCategoryInfo(exp.category);
                        const Icon = cat.icon;
                        return (
                            <div key={exp.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{cat.label}</p>
                                        {exp.note && <p className="text-[11px] text-slate-400 italic">"{exp.note}"</p>}
                                        <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">
                                            {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-rose-600">
                                        -{isPrivacyMode ? '•••' : `Rp ${Number(exp.amount).toLocaleString('id-ID')}`}
                                    </p>
                                    <button
                                        onClick={() => setConfirmDelete(exp)}
                                        className="p-1.5 rounded-lg text-slate-200 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}>
                    <div
                        className="w-full max-w-[420px] mx-4 mb-4 bg-white rounded-[32px] shadow-2xl border border-white/40 animate-[scaleIn_0.25s_ease-out] flex flex-col"
                        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Sticky header */}
                        <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
                            <h2 className="text-xl font-extrabold text-slate-800">Catat Pengeluaran</h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 hover:bg-slate-100 hover:rotate-90 rounded-full text-slate-400 transition-all duration-300"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto px-6 pb-24">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nominal</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {QUICK_AMOUNTS.map(v => (
                                        <button key={v} type="button" onClick={() => setFormData(f => ({ ...f, amount: v.toLocaleString('id-ID') }))}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${formData.amount === v.toLocaleString('id-ID') ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-200'}`}>
                                            {v >= 1000 ? `${v / 1000}rb` : v}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                    <input type="text" value={formData.amount}
                                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setFormData(f => ({ ...f, amount: v ? parseInt(v).toLocaleString('id-ID') : '' })); }}
                                        className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-lg font-extrabold text-slate-800 shadow-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                        placeholder="0" />
                                </div>
                                {errors.amount && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.amount}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {EXPENSE_CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isSelected = formData.category === cat.id;
                                        return (
                                            <button key={cat.id} type="button" onClick={() => setFormData(f => ({ ...f, category: cat.id }))}
                                                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'border-opacity-100 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                style={isSelected ? { borderColor: cat.color, backgroundColor: cat.bg } : {}}>
                                                <Icon className="w-4 h-4" style={{ color: isSelected ? cat.color : '#94a3b8' }} />
                                                <span className="text-[9px] font-bold" style={{ color: isSelected ? cat.color : '#94a3b8' }}>{cat.id}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Note + Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Catatan</label>
                                    <input type="text" value={formData.note} onChange={e => setFormData(f => ({ ...f, note: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-400"
                                        placeholder="Opsional..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-2xl px-3 py-3 text-sm outline-none focus:border-rose-400" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-2xl font-bold mt-1 shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all active:scale-[0.98]">
                                Simpan Pengeluaran
                            </button>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => { deleteExpense(confirmDelete.id); addToast('Pengeluaran dihapus', 'success'); setConfirmDelete(null); }}
                title="Hapus Pengeluaran?"
                message={`Pengeluaran Rp ${confirmDelete?.amount?.toLocaleString('id-ID')} (${confirmDelete?.category}) akan dihapus.`}
                confirmText="Hapus"
                type="danger"
            />
        </main>
    );
}
