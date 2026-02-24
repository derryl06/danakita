import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function TransactionItem({
    amount,
    date,
    targetName,
    note,
    type = 'in'
}) {
    const isIncome = type === 'in';

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-[16px] border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                    <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{targetName}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                    {note && <p className="text-xs text-slate-500 mt-1 italic">{note}</p>}
                </div>
            </div>
            <div>
                <p className={`font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-[var(--color-text-primary)]'}`}>
                    {isIncome ? '+' : '-'}{amount.toLocaleString('id-ID')}
                </p>
            </div>
        </div>
    );
}
