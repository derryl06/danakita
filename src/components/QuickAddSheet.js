'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuickAdd } from '../context/QuickAddContext';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { X, ScanLine } from 'lucide-react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import ReceiptScannerModal from './ReceiptScannerModal';

export default function QuickAddSheet() {
    const { isOpen, setIsOpen } = useQuickAdd();
    const { targets, addTransaction } = useAppContext();
    const { addToast } = useToast();
    const router = useRouter();

    const [amount, setAmount] = useState('');
    const [targetId, setTargetId] = useState('');
    const [type, setType] = useState('in');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const hasInitializedOnOpen = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            hasInitializedOnOpen.current = false;
            return;
        }

        if (!hasInitializedOnOpen.current && targets?.length > 0) {
            setTimeout(() => {
                setTargetId(prev => prev || (targets.length > 0 ? targets[0].id : ''));
            }, 0);
            hasInitializedOnOpen.current = true;
        }
    }, [isOpen, targets]);

    if (!isOpen) return null;

    const schema = z.object({
        amount: z.number().min(1000, 'Minimal Rp 1.000'),
        targetId: z.string().min(1, 'Pilih target'),
        note: z.string().optional()
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedAmount = parseInt(amount.replace(/\D/g, '') || '0', 10);

        try {
            schema.parse({ amount: parsedAmount, targetId, note });
            setErrors({});

            const target = targets.find(t => t.id === targetId);

            // Check if this transaction completes the goal
            if (type === 'in' && target && target.target_amount > 0) {
                if (target.current_amount < target.target_amount && (target.current_amount + parsedAmount) >= target.target_amount) {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                        zIndex: 9999
                    });
                }
            }

            addTransaction({
                id: Date.now().toString(),
                targetId,
                amount: parsedAmount,
                type,
                note,
                date: new Date().toISOString()
            });

            setIsOpen(false);
            setAmount('');
            setNote('');
            setType('in');

            // Show toast notification
            const targetName = target ? target.name : '';
            addToast(
                type === 'in'
                    ? `+Rp ${parsedAmount.toLocaleString('id-ID')} ke ${targetName} 🎉`
                    : `-Rp ${parsedAmount.toLocaleString('id-ID')} dari ${targetName}`,
                type === 'in' ? 'success' : 'info'
            );
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors = {};
                err.errors.forEach(e => {
                    newErrors[e.path[0]] = e.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
            setAmount(parseInt(val, 10).toLocaleString('id-ID'));
        } else {
            setAmount('');
        }
    };

    const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

    const setQuickAmount = (val) => {
        setAmount(val.toLocaleString('id-ID'));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-[400px] mb-4 mx-4 bg-white rounded-[32px] shadow-2xl border border-white/40 animate-[scaleIn_0.25s_ease-out] relative flex flex-col"
                style={{ maxHeight: 'calc(100dvh - 2rem)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-center px-6 pt-6 pb-4 relative z-10 shrink-0">
                    <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                        Catat Transaksi
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            title="Scan Nota / QRIS"
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-50 to-blue-50 hover:from-violet-100 hover:to-blue-100 border border-violet-200 rounded-full text-violet-600 text-[11px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm"
                        >
                            <ScanLine className="w-3.5 h-3.5" /> Scan Nota
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 hover:rotate-90 rounded-full text-slate-500 transition-all duration-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto px-6 pb-24 relative z-10">

                {/* Receipt Scanner Modal */}
                <ReceiptScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onAmountDetected={(val) => {
                        setAmount(val.toLocaleString('id-ID'));
                        setIsScannerOpen(false);
                    }}
                />

                {targets.length === 0 ? (
                    <div className="text-center py-8 relative z-10">
                        <p className="text-slate-500 mb-6 font-medium text-sm">Kamu belum punya target. Buat target dulu.</p>
                        <button
                            onClick={() => { setIsOpen(false); router.push('/target'); }}
                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white py-3.5 rounded-[16px] font-bold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                        >
                            Buat Target Baru
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Pilih Target</label>
                            <select
                                value={targetId}
                                onChange={e => setTargetId(e.target.value)}
                                className="w-full border border-slate-200 rounded-[16px] px-4 py-3.5 bg-white shadow-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] font-semibold text-slate-700 transition-all text-sm"
                            >
                                {targets.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.targetId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.targetId}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Jenis</label>
                            <div className="flex rounded-[16px] bg-slate-100 p-1 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setType('in')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-[12px] transition-all duration-300 ${type === 'in' ? 'bg-white text-[var(--color-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Menabung
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('out')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-[12px] transition-all duration-300 ${type === 'out' ? 'bg-white text-red-500 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Tarik Dana
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Nominal</label>
                            {/* Quick Amount Buttons */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {quickAmounts.map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setQuickAmount(val)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${amount === val.toLocaleString('id-ID')
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'}`}
                                    >
                                        {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full border border-slate-200 rounded-[16px] pl-12 pr-4 py-3.5 text-lg font-extrabold text-slate-800 shadow-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-slate-300 placeholder:font-medium transition-all"
                                    placeholder="0"
                                />
                            </div>
                            {errors.amount && <p className="text-red-500 text-xs mt-1 ml-1">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Catatan (Opsional)</label>
                            <input
                                type="text"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="w-full border border-slate-200 rounded-[16px] px-4 py-3.5 bg-white shadow-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-slate-400 text-sm transition-all"
                                placeholder="Misal: Gaji bulan ini"
                            />
                        </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white py-4 rounded-[16px] font-bold mt-2 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                            >
                                Simpan Transaksi
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
