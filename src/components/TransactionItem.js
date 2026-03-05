import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function TransactionItem({
    amount,
    date,
    targetName,
    note,
    type = 'in',
    userName
}) {
    const isIncome = type === 'in';

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-slate-100 shadow-sm hover:border-blue-100 transition-all group">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight">{targetName}</h4>
                        {userName && (
                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Oleh: {userName}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">
                        {format(new Date(date), 'dd MMM yyyy • HH:mm', { locale: id })}
                    </p>
                    {note && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{note}</p>}
                </div>
            </div>
            <div className="text-right">
                <p className={`font-black text-sm tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}{amount.toLocaleString('id-ID')}
                </p>
            </div>
        </div>
    );
}
