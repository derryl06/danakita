'use client';

import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import TransactionItem from '../../components/TransactionItem';
import { ArrowLeftRight } from 'lucide-react';

export default function RiwayatPage() {
    const { transactions, targets } = useAppContext();

    const getTargetName = (id) => {
        const target = targets.find(t => t.id === id);
        return target ? target.name : 'Target Dihapus';
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)]">
            <TopBar title="Riwayat Transaksi" />

            <div className="px-5 mt-6 flex-1 flex flex-col">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 -mt-10">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                            <ArrowLeftRight className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Belum ada transaksi</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-[250px]">
                            Setiap kali kamu menambah atau menggunakan tabungan, riwayatnya akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
                        <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Semua Riwayat</h3>

                        {transactions.map(t => (
                            <TransactionItem
                                key={t.id}
                                type={t.type}
                                amount={t.amount}
                                date={t.date}
                                note={t.note}
                                targetName={getTargetName(t.targetId)}
                                userName={t.user_name}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
