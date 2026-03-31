'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuickAdd } from '../context/QuickAddContext';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { X, ScanLine, ShoppingBag, Utensils, Car, Zap, Package } from 'lucide-react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import ReceiptScannerModal from './ReceiptScannerModal';

const COMMON_CATEGORIES = [
    { id: 'Makan', label: 'Makan', icon: Utensils, color: '#f59e0b', bg: '#fef3c7' },
    { id: 'Transport', label: 'Transport', icon: Car, color: '#3b82f6', bg: '#dbeafe' },
    { id: 'Belanja', label: 'Belanja', icon: ShoppingBag, color: '#ec4899', bg: '#fce7f3' },
    { id: 'Tagihan', label: 'Tagihan', icon: Zap, color: '#10b981', bg: '#d1fae5' },
    { id: 'Lainnya', label: 'Lainnya', icon: Package, color: '#64748b', bg: '#f1f5f9' },
];

export default function QuickAddSheet() {
    const { isOpen, setIsOpen, prefillData } = useQuickAdd();
    const { targets, addTransaction, addExpense } = useAppContext();
    const { addToast } = useToast();
    const router = useRouter();

    const [amount, setAmount] = useState('');
    const [targetId, setTargetId] = useState('');
    const [type, setType] = useState('in'); // in (save), out (withdraw), expense (general)
    const [category, setCategory] = useState('Makan');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const hasInitializedOnOpen = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            hasInitializedOnOpen.current = false;
            return;
        }

        if (prefillData) {
            if (prefillData.amount) setAmount(prefillData.amount.toLocaleString('id-ID'));
            if (prefillData.type) setType(prefillData.type);
            if (prefillData.category) setCategory(prefillData.category);
        } else if (!hasInitializedOnOpen.current && targets?.length > 0) {
            setTimeout(() => {
                setTargetId(prev => prev || (targets.length > 0 ? targets[0].id : ''));
            }, 0);
            hasInitializedOnOpen.current = true;
        }
    }, [isOpen, targets, prefillData]);

    if (!isOpen) return null;

    const schema = z.object({
        amount: z.number().min(100, 'Minimal Rp 100'),
        targetId: z.string().optional(),
        category: z.string().optional(),
        note: z.string().optional()
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedAmount = parseInt(amount.replace(/\D/g, '') || '0', 10);

        try {
            schema.parse({ amount: parsedAmount, targetId, note });
            setErrors({});

            if (type === 'expense') {
                addExpense({
                    id: Date.now().toString(),
                    amount: parsedAmount,
                    category,
                    note,
                    date: new Date().toISOString()
                });
                addToast(`Pengeluaran -Rp ${parsedAmount.toLocaleString('id-ID')} dicatat 📝`, 'info');
            } else {
                const target = targets.find(t => t.id === targetId);
                
                // Final validation if not expense
                if (!targetId) {
                    setErrors({ targetId: 'Pilih target' });
                    return;
                }

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

                const targetName = target ? target.name : '';
                addToast(
                    type === 'in'
                        ? `+Rp ${parsedAmount.toLocaleString('id-ID')} ke ${targetName} 🎉`
                        : `-Rp ${parsedAmount.toLocaleString('id-ID')} dari ${targetName}`,
                    type === 'in' ? 'success' : 'info'
                );
            }

            setIsOpen(false);
            setAmount('');
            setNote('');
            setType('in');

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

    const quickAmounts = [20000, 50000, 100000, 200000, 500000];

    const setQuickAmount = (val) => {
        setAmount(val.toLocaleString('id-ID'));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-[420px] mb-4 mx-4 bg-white rounded-[32px] shadow-2xl border border-white/40 animate-[scaleIn_0.25s_ease-out] relative flex flex-col"
                style={{ maxHeight: 'calc(100dvh - 2rem)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-center px-6 pt-6 pb-4 relative z-10 shrink-0">
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
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
                            setType('expense'); // Set to expense automatically when scanned
                            setIsScannerOpen(false);
                        }}
                    />

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                        
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Kategori Transaksi</label>
                            <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setType('in')}
                                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 ${type === 'in' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
                                >
                                    Nabung
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('out')}
                                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 ${type === 'out' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
                                >
                                    Tarik
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 ${type === 'expense' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-400'}`}
                                >
                                    Keluar
                                </button>
                            </div>
                        </div>

                        {type === 'expense' ? (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Jenis Pengeluaran</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {COMMON_CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isSelected = category === cat.id;
                                        return (
                                            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                                                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'shadow-sm' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                                                style={isSelected ? { borderColor: cat.color, backgroundColor: cat.bg } : {}}>
                                                <Icon className="w-4 h-4" style={{ color: isSelected ? cat.color : '#94a3b8' }} />
                                                <span className="text-[8px] font-black uppercase" style={{ color: isSelected ? cat.color : '#94a3b8' }}>{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Pilih Target</label>
                                {targets.length === 0 ? (
                                    <button onClick={() => { setIsOpen(false); router.push('/target'); }} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold bg-slate-50 hover:bg-white hover:border-blue-300 transition-all">
                                        + Buat Target Baru
                                    </button>
                                ) : (
                                    <select
                                        value={targetId}
                                        onChange={e => setTargetId(e.target.value)}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-4 bg-white shadow-sm outline-none focus:border-blue-500 font-bold text-slate-700 transition-all text-sm"
                                    >
                                        {targets.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                )}
                                {errors.targetId && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.targetId}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Nominal</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {quickAmounts.map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setQuickAmount(val)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all active:scale-95 ${amount === val.toLocaleString('id-ID')
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'}`}
                                    >
                                        {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">Rp</span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-2xl font-black text-slate-800 shadow-sm outline-none focus:border-blue-500 placeholder:text-slate-200 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            {errors.amount && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Keterangan (Opsional)</label>
                            <input
                                type="text"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-white shadow-sm outline-none focus:border-blue-500 placeholder:text-slate-300 text-sm font-bold transition-all"
                                placeholder={type === 'expense' ? 'Misal: Beli makan siang' : 'Catatan tambahan...'}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-4.5 rounded-[20px] font-black text-white mt-2 shadow-lg transition-all duration-300 active:scale-[0.98] ${type === 'in' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30'}`}
                        >
                            Simpan {type === 'expense' ? 'Pengeluaran' : 'Transaksi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
