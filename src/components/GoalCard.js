'use client';

import { memo, useState } from 'react';
import { Heart, Home, GraduationCap, AlertCircle, Coins, ChevronRight, Trash2, Pencil, Building2, Gem, Wallet, LineChart, Tags } from 'lucide-react';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import ConfirmModal from './ConfirmModal';
import { useAppContext } from '../context/AppContext';

const GoalCard = memo(function GoalCard({
    id,
    name,
    category = 'General',
    currentAmount = 0,
    targetAmount = 0,
    deadline,
    neededPerMonth,
    isHero = false,
    status = 'Belum disetel',
    statusType = 'neutral',
    isInflationAdjusted = false,
    originalTargetAmount = 0,
    storageLocation = 'Bank',
    actionButton,
    onDelete,
    onEdit
}) {
    const { isPrivacyMode } = useAppContext();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    const getCategoryIcon = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'menikah': return <Heart className="w-4 h-4 text-rose-500" />;
            case 'rumah': return <Home className="w-4 h-4 text-blue-500" />;
            case 'pendidikan': return <GraduationCap className="w-4 h-4 text-indigo-500" />;
            case 'darurat': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Tags className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStorageIcon = (loc) => {
        switch (loc) {
            case 'Bank': return <Building2 className="w-3 h-3 text-blue-500" />;
            case 'Emas': return <Gem className="w-3 h-3 text-amber-500" />;
            case 'Tunai': return <Wallet className="w-3 h-3 text-emerald-500" />;
            case 'Reksadana': return <LineChart className="w-3 h-3 text-indigo-500" />;
            default: return <Building2 className="w-3 h-3 text-blue-500" />;
        }
    };

    const formatCur = (num) => {
        if (isPrivacyMode) return 'Rp •••••••';
        return 'Rp ' + num.toLocaleString('id-ID');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Belum ada deadline';
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    };

    return (
        <>
            <div className={`p-5 rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)]/30 transition-all duration-300 group overflow-hidden relative ${isHero ? 'bg-gradient-to-br from-blue-50/80 via-white to-white' : ''}`}>
                {isHero && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl -mr-8 -mt-8"></div>}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex gap-3">
                        <div className="mt-1 p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                            {getCategoryIcon(category)}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1 group-hover:text-[var(--color-primary)] transition-colors">{name}</h3>
                            <p className={`font-black text-[var(--color-text-primary)] tracking-tight ${isHero ? 'text-2xl' : 'text-xl'}`}>
                                {formatCur(currentAmount)}
                            </p>
                            {targetAmount > 0 && (
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                                    DARI {formatCur(targetAmount)}
                                    {isInflationAdjusted && (
                                        <span className="ml-1.5 text-blue-500 bg-blue-50 px-1 py-0.5 rounded-md border border-blue-100/50">
                                            +INFLASI
                                        </span>
                                    )}
                                </p>
                            )}
                            {isInflationAdjusted && originalTargetAmount > 0 && (
                                <p className="text-[8px] font-bold text-slate-300 mt-0.5">
                                    Nilai asli: {formatCur(originalTargetAmount)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusChip status={status} type={statusType} />
                        <div className="flex gap-1">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(id);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Edit Target"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Hapus Target"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <ProgressBar progress={progress} />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-4 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <span>🎯 {targetAmount > 0 ? formatDate(deadline) : 'Belum disetel'}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <div className="flex items-center gap-1 text-slate-500">
                            {getStorageIcon(storageLocation)}
                            {storageLocation}
                        </div>
                    </div>
                    {neededPerMonth > 0 && (
                        <span className="text-blue-600">Butuh {formatCur(neededPerMonth)}/bln</span>
                    )}
                </div>

                {actionButton && (
                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        {actionButton}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => onDelete(id)}
                title="Hapus Target?"
                message={`Target "${name}" dan semua datanya akan dihapus secara permanen.`}
                confirmText="Hapus"
                type="danger"
            />
        </>
    );
});

export default GoalCard;
