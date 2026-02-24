import clsx from 'clsx';
import { TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function StatusChip({ status, type }) {
    // type: 'success' | 'warning' | 'neutral'
    const config = {
        success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: TrendingUp },
        warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle },
        neutral: { bg: 'bg-slate-100', text: 'text-slate-500', icon: Clock }
    };

    const selected = config[type] || config.neutral;
    const Icon = selected.icon;

    return (
        <div className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", selected.bg, selected.text)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{status}</span>
        </div>
    );
}
