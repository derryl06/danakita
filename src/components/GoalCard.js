import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';

export default function GoalCard({
    name,
    currentAmount = 0,
    targetAmount = 0,
    deadline,
    neededPerMonth,
    isHero = false,
    status = 'Belum disetel',
    statusType = 'neutral',
    actionButton
}) {
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    const formatCur = (num) => {
        return 'Rp ' + num.toLocaleString('id-ID');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Belum ada deadline';
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    };

    return (
        <div className={`p-5 rounded-[24px] border border-[var(--color-border)] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 transition-all duration-300 group ${isHero ? 'bg-gradient-to-br from-blue-50/50 via-white to-white' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1 group-hover:text-[var(--color-primary)] transition-colors">{name}</h3>
                    <p className={`font-extrabold text-[var(--color-text-primary)] tracking-tight ${isHero ? 'text-3xl' : 'text-xl'}`}>
                        {formatCur(currentAmount)}
                    </p>
                    {targetAmount > 0 && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            dari {formatCur(targetAmount)}
                        </p>
                    )}
                </div>
                <StatusChip status={status} type={statusType} />
            </div>

            <div className="mb-4">
                <ProgressBar progress={progress} />
            </div>

            <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/50">
                <span>🎯 {targetAmount > 0 ? formatDate(deadline) : 'Belum disetel'}</span>
                {neededPerMonth > 0 && (
                    <span className="font-bold text-blue-600">Butuh {formatCur(neededPerMonth)}/bln</span>
                )}
            </div>

            {actionButton && (
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                    {actionButton}
                </div>
            )}
        </div>
    );
}
