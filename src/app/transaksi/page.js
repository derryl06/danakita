'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Calendar, Tag, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransaksiPage() {
    const { transactions, targets, reactToTransaction, user } = useAppContext();
    const router = useRouter();

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

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)]">
            <TopBar
                title="Riwayat Transaksi"
                rightComponent={
                    <button onClick={() => router.back()} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col">
                {transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {tx.type === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {tx.type === 'in' ? 'Menabung' : 'Tarik Dana'}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                                            <Tag className="w-3 h-3" />
                                            <span>{getTargetName(tx.targetId)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                                            {formatDate(tx.date)}
                                        </p>

                                        {/* Interaction Section */}
                                        {user && (
                                            <div className="flex items-center gap-2 mt-2">
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
                                                    KIRIM SEMANGAT!
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black tracking-tight ${tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'in' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
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
        </main>
    );
}
