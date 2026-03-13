'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Calendar, Tag, Flame, Search, Filter, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function TransaksiPage() {
    const { transactions, targets, reactToTransaction, deleteTransaction, user, isPrivacyMode } = useAppContext();
    const router = useRouter();
    const { addToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, in, out
    const [filterTarget, setFilterTarget] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
    const [confirmDelete, setConfirmDelete] = useState(null);

    const getTargetName = (id) => {
        const target = targets.find(t => t.id === id);
        return target ? target.name : 'Target dihapus';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(tx =>
                (tx.note && tx.note.toLowerCase().includes(q)) ||
                getTargetName(tx.targetId).toLowerCase().includes(q) ||
                (tx.user_name && tx.user_name.toLowerCase().includes(q))
            );
        }

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(tx => tx.type === filterType);
        }

        // Filter by target
        if (filterTarget !== 'all') {
            result = result.filter(tx => tx.targetId === filterTarget);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date || 0) - new Date(b.date || 0);
                case 'amount-desc':
                    return (b.amount || 0) - (a.amount || 0);
                case 'amount-asc':
                    return (a.amount || 0) - (b.amount || 0);
                default: // date-desc
                    return new Date(b.date || 0) - new Date(a.date || 0);
            }
        });

        return result;
    }, [transactions, searchQuery, filterType, filterTarget, sortBy, targets]);

    const handleDelete = async (tx) => {
        try {
            await deleteTransaction(tx.id);
            addToast('Transaksi berhasil dihapus', 'success');
        } catch (err) {
            addToast('Gagal menghapus transaksi', 'error');
        }
    };

    const activeFilterCount = (filterType !== 'all' ? 1 : 0) + (filterTarget !== 'all' ? 1 : 0) + (sortBy !== 'date-desc' ? 1 : 0);

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] page-transition">
            <TopBar
                title="Riwayat Transaksi"
                rightComponent={
                    <button onClick={() => router.back()} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col">
                {/* Search & Filter Bar */}
                <div className="mb-4 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari transaksi..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-2xl border transition-all shadow-sm relative ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-5 h-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-[fadeInUp_0.2s_ease-out] flex flex-col gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Jenis Transaksi</label>
                                <div className="flex gap-2">
                                    {[{ v: 'all', l: 'Semua' }, { v: 'in', l: 'Menabung' }, { v: 'out', l: 'Tarik Dana' }].map(opt => (
                                        <button
                                            key={opt.v}
                                            onClick={() => setFilterType(opt.v)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === opt.v ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target</label>
                                <select
                                    value={filterTarget}
                                    onChange={e => setFilterTarget(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium bg-white focus:outline-none focus:border-blue-400"
                                >
                                    <option value="all">Semua Target</option>
                                    {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Urutkan</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { v: 'date-desc', l: 'Terbaru' },
                                        { v: 'date-asc', l: 'Terlama' },
                                        { v: 'amount-desc', l: 'Nominal ↓' },
                                        { v: 'amount-asc', l: 'Nominal ↑' },
                                    ].map(opt => (
                                        <button
                                            key={opt.v}
                                            onClick={() => setSortBy(opt.v)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${sortBy === opt.v ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={() => { setFilterType('all'); setFilterTarget('all'); setSortBy('date-desc'); }}
                                    className="text-[10px] font-bold text-rose-500 hover:underline self-center"
                                >
                                    Reset Semua Filter
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-3 text-xs font-bold text-slate-400">
                    {filteredTransactions.length} transaksi {searchQuery && `untuk "${searchQuery}"`}
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">
                            {searchQuery || filterType !== 'all' || filterTarget !== 'all' ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredTransactions.map((tx) => (
                            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`p-3 rounded-xl shrink-0 ${tx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {tx.type === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {tx.type === 'in' ? 'Menabung' : 'Tarik Dana'}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                                            <Tag className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{getTargetName(tx.targetId)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                                            {formatDate(tx.date)}
                                        </p>

                                        {/* Interaction Section */}
                                        <div className="flex items-center gap-2 mt-2">
                                            {user && (
                                                <button
                                                    onClick={() => reactToTransaction(tx.id, '🔥')}
                                                    className={`p-1.5 rounded-lg flex items-center gap-1 text-[9px] font-black transition-all border ${tx.reactions?.[user.uid] === '🔥'
                                                        ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm'
                                                        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-orange-400'
                                                        }`}
                                                >
                                                    <Flame className={`w-3 h-3 ${tx.reactions?.[user.uid] === '🔥' ? 'fill-orange-500' : ''}`} />
                                                    {Object.keys(tx.reactions || {}).length > 0 && (
                                                        <span className="bg-orange-600 text-white px-1 rounded-sm text-[8px]">{Object.keys(tx.reactions).length}</span>
                                                    )}
                                                    SEMANGAT!
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setConfirmDelete(tx)}
                                                className="p-1.5 rounded-lg flex items-center gap-1 text-[9px] font-black transition-all border bg-white text-slate-300 border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                HAPUS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className={`font-black tracking-tight ${tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'in' ? '+' : '-'} {isPrivacyMode ? '•••' : `Rp ${tx.amount?.toLocaleString('id-ID')}`}
                                    </p>
                                    {tx.note && (
                                        <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-[100px] truncate">
                                            &quot;{tx.note}&quot;
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => handleDelete(confirmDelete)}
                title="Hapus Transaksi?"
                message={`Transaksi ${confirmDelete?.type === 'in' ? 'menabung' : 'tarik dana'} sebesar Rp ${confirmDelete?.amount?.toLocaleString('id-ID')} akan dihapus dan saldo target akan dikembalikan.`}
                confirmText="Hapus"
                type="danger"
            />
        </main>
    );
}
