'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import {
    HandCoins, TrendingDown, Plus, X, Trash2, CheckCircle2, Clock, AlertTriangle, Users, ArrowRight, ArrowLeft
} from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export default function HutangPage() {
    const { debts, addDebt, deleteDebt, settleDebt, isPrivacyMode } = useAppContext();
    const { addToast } = useToast();

    const [isAdding, setIsAdding] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [tab, setTab] = useState('hutang'); // 'hutang' | 'piutang'
    const [formData, setFormData] = useState({ type: 'hutang', person_name: '', amount: '', description: '', due_date: '' });
    const [errors, setErrors] = useState({});

    const hutangList = useMemo(() => (debts || []).filter(d => d.type === 'hutang' && !d.is_paid), [debts]);
    const piutangList = useMemo(() => (debts || []).filter(d => d.type === 'piutang' && !d.is_paid), [debts]);
    const paidList = useMemo(() => (debts || []).filter(d => d.is_paid), [debts]);

    const totalHutang = hutangList.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const totalPiutang = piutangList.reduce((s, d) => s + (Number(d.amount) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amt = parseInt(formData.amount.replace(/\D/g, '') || '0', 10);
        if (!formData.person_name.trim()) { setErrors({ person_name: 'Nama wajib diisi' }); return; }
        if (amt < 1000) { setErrors({ amount: 'Minimal Rp 1.000' }); return; }
        setErrors({});
        addDebt({
            id: Date.now().toString(),
            type: formData.type,
            person_name: formData.person_name.trim(),
            amount: amt,
            description: formData.description,
            due_date: formData.due_date || null,
            is_paid: false,
            created_at: new Date().toISOString(),
        });
        addToast(`${formData.type === 'hutang' ? 'Hutang' : 'Piutang'} ke ${formData.person_name} dicatat 📋`, 'info');
        setIsAdding(false);
        setFormData({ type: 'hutang', person_name: '', amount: '', description: '', due_date: '' });
    };

    const fmt = (n) => {
        if (isPrivacyMode) return 'Rp •••';
        return `Rp ${Number(n).toLocaleString('id-ID')}`;
    };

    const getDaysInfo = (due_date) => {
        if (!due_date) return null;
        const parsed = parseISO(due_date);
        if (!isValid(parsed)) return null;
        const days = differenceInDays(parsed, new Date());
        return days;
    };

    const activeList = tab === 'hutang' ? hutangList : piutangList;
    const activeColor = tab === 'hutang' ? 'rose' : 'emerald';

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] page-transition">
            <TopBar
                title="Hutang & Piutang"
                subtitle="Kelola pinjam-meminjam"
                rightComponent={
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md shadow-indigo-500/30 hover:bg-indigo-600 transition-all active:scale-95">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                }
            />

            <div className="px-5 mt-6 flex flex-col gap-5">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowLeft className="w-4 h-4 text-rose-500" />
                            <span className="text-[10px] font-bold text-rose-600 uppercase">Total Hutang</span>
                        </div>
                        <p className="text-lg font-black text-rose-700">{fmt(totalHutang)}</p>
                        <p className="text-[10px] text-rose-400 font-medium mt-1">{hutangList.length} transaksi aktif</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Piutang</span>
                        </div>
                        <p className="text-lg font-black text-emerald-700">{fmt(totalPiutang)}</p>
                        <p className="text-[10px] text-emerald-400 font-medium mt-1">{piutangList.length} transaksi aktif</p>
                    </div>
                </div>

                {/* Net Position */}
                {(totalHutang > 0 || totalPiutang > 0) && (
                    <div className={`rounded-2xl p-4 border ${totalPiutang >= totalHutang ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Posisi Bersih</span>
                            <span className={`text-base font-black ${totalPiutang >= totalHutang ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {totalPiutang >= totalHutang ? '+' : '-'}{fmt(Math.abs(totalPiutang - totalHutang))}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {totalPiutang >= totalHutang ? '✅ Kamu lebih banyak memberikan pinjaman' : '⚠️ Kamu lebih banyak berhutang'}
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1">
                    {[{ id: 'hutang', label: '😣 Hutang Saya' }, { id: 'piutang', label: '🤝 Piutang Saya' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tab === t.id ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex flex-col gap-3">
                    {activeList.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 flex flex-col items-center border border-slate-100 shadow-sm">
                            <HandCoins className="w-10 h-10 text-slate-200 mb-3" />
                            <p className="text-slate-400 font-medium text-sm text-center">
                                {tab === 'hutang' ? 'Tidak ada hutang aktif 🎉' : 'Tidak ada piutang aktif'}
                            </p>
                        </div>
                    ) : activeList.map(debt => {
                        const daysLeft = getDaysInfo(debt.due_date);
                        const isOverdue = daysLeft !== null && daysLeft < 0;
                        const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                        return (
                            <div key={debt.id} className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${isOverdue ? 'border-rose-200' : isDueSoon ? 'border-amber-200' : 'border-slate-100'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tab === 'hutang' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                                            <Users className={`w-5 h-5 ${tab === 'hutang' ? 'text-rose-500' : 'text-emerald-500'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-700 text-sm truncate">{debt.person_name}</p>
                                            {debt.description && <p className="text-[11px] text-slate-400 italic truncate">"{debt.description}"</p>}
                                            {debt.due_date && (
                                                <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${isOverdue ? 'text-rose-500' : isDueSoon ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {isOverdue ? <AlertTriangle className="w-3 h-3" /> : isDueSoon ? <Clock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {isOverdue ? `Terlambat ${Math.abs(daysLeft)} hari!` : daysLeft === 0 ? 'Jatuh tempo hari ini!' : `${daysLeft} hari lagi`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-black text-base ${tab === 'hutang' ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(debt.amount)}</p>
                                        <div className="flex gap-1.5 mt-2 justify-end">
                                            <button
                                                onClick={() => { settleDebt(debt.id); addToast(`${tab === 'hutang' ? 'Hutang' : 'Piutang'} lunas! ✅`, 'success'); }}
                                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
                                                title="Tandai Lunas"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setConfirmDelete(debt)} className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 hover:border-rose-100">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Paid / Settled */}
                {paidList.length > 0 && (
                    <details className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <summary className="px-5 py-4 cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {paidList.length} Sudah Lunas
                        </summary>
                        <div className="flex flex-col divide-y divide-slate-50">
                            {paidList.map(debt => (
                                <div key={debt.id} className="flex items-center justify-between px-5 py-3 opacity-60">
                                    <div>
                                        <p className="text-sm font-bold text-slate-600 line-through">{debt.person_name}</p>
                                        <p className="text-[10px] text-slate-400">{debt.type === 'hutang' ? '↑ Hutang' : '↓ Piutang'}</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-400 line-through">{fmt(debt.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}>
                    <div
                        className="w-full max-w-[420px] mx-4 mb-4 bg-white rounded-[32px] shadow-2xl animate-[scaleIn_0.25s_ease-out] flex flex-col"
                        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Sticky header */}
                        <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
                            <h2 className="text-xl font-extrabold text-slate-800">Tambah Hutang/Piutang</h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 hover:rotate-90 rounded-full text-slate-400 transition-all duration-300"><X className="w-5 h-5" /></button>
                        </div>
                        {/* Scrollable body */}
                        <div className="overflow-y-auto px-6 pb-24 flex flex-col gap-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Type */}
                            <div className="flex bg-slate-100 rounded-2xl p-1">
                                {[{ id: 'hutang', label: '😣 Saya Berhutang' }, { id: 'piutang', label: '🤝 Orang Lain Hutang' }].map(t => (
                                    <button key={t.id} type="button" onClick={() => setFormData(f => ({ ...f, type: t.id }))}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${formData.type === t.id ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Orang</label>
                                <input type="text" value={formData.person_name} onChange={e => setFormData(f => ({ ...f, person_name: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                    placeholder={formData.type === 'hutang' ? 'Hutang ke siapa?' : 'Siapa yang hutang?'} />
                                {errors.person_name && <p className="text-rose-500 text-xs mt-1">{errors.person_name}</p>}
                            </div>
                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nominal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                    <input type="text" value={formData.amount}
                                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setFormData(f => ({ ...f, amount: v ? parseInt(v).toLocaleString('id-ID') : '' })); }}
                                        className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-lg font-extrabold text-slate-800 outline-none focus:border-indigo-400"
                                        placeholder="0" />
                                </div>
                                {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
                            </div>
                            {/* Description + Due */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Keterangan</label>
                                    <input type="text" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Untuk apa..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jatuh Tempo</label>
                                    <input type="date" value={formData.due_date} onChange={e => setFormData(f => ({ ...f, due_date: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-2xl px-3 py-3 text-sm outline-none focus:border-indigo-400" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                                Simpan
                            </button>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => { deleteDebt(confirmDelete.id); addToast('Data dihapus', 'success'); setConfirmDelete(null); }}
                title="Hapus Data?"
                message={`${confirmDelete?.type === 'hutang' ? 'Hutang' : 'Piutang'} ke ${confirmDelete?.person_name} sebesar Rp ${Number(confirmDelete?.amount)?.toLocaleString('id-ID')} akan dihapus.`}
                confirmText="Hapus"
                type="danger"
            />
        </main>
    );
}
