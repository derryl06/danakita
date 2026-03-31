'use client';

import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

function getColor(amount) {
    if (amount === 0) return { bg: '#f1f5f9', label: '' };
    if (amount < 50000) return { bg: '#bbf7d0', label: 'Light' };
    if (amount < 200000) return { bg: '#4ade80', label: 'Medium' };
    if (amount < 500000) return { bg: '#16a34a', label: 'Good' };
    return { bg: '#15803d', label: 'Excellent' };
}

export default function SavingsHeatmap({ transactions, compact }) {
    // Build last 56 days (8 weeks)
    const days = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 55);
        return eachDayOfInterval({ start, end });
    }, []);

    const savingsByDay = useMemo(() => {
        const map = {};
        (transactions || []).forEach(tx => {
            if (tx.type !== 'in' || !tx.date) return;
            const key = format(new Date(tx.date), 'yyyy-MM-dd');
            map[key] = (map[key] || 0) + (Number(tx.amount) || 0);
        });
        return map;
    }, [transactions]);

    // Split days into weeks (columns of 7)
    const weeks = useMemo(() => {
        const result = [];
        let current = [];
        days.forEach((day, i) => {
            current.push(day);
            if (current.length === 7) { result.push(current); current = []; }
        });
        if (current.length) result.push(current);
        return result;
    }, [days]);

    const totalDaysActive = useMemo(() => {
        return days.filter(d => {
            const key = format(d, 'yyyy-MM-dd');
            return (savingsByDay[key] || 0) > 0;
        }).length;
    }, [days, savingsByDay]);

    const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    if (compact) {
        return (
            <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {week.map((day, di) => {
                                const key = format(day, 'yyyy-MM-dd');
                                const amount = savingsByDay[key] || 0;
                                const { bg } = getColor(amount);
                                return (
                                    <div
                                        key={key}
                                        className="w-[14px] h-[14px] rounded-[3px] transition-transform hover:scale-125"
                                        style={{ backgroundColor: bg }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Heatmap Kebiasaan Nabung</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">56 hari terakhir</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{totalDaysActive}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Hari Aktif</p>
                </div>
            </div>

            <div className="overflow-x-auto pb-1">
                <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-1">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="h-[18px] flex items-center">
                                <span className="text-[9px] font-bold text-slate-300 w-6">{d}</span>
                            </div>
                        ))}
                    </div>
                    {/* Weeks */}
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {/* Month label for first day of each week */}
                            <div className="h-0 relative">
                                {week[0] && new Date(week[0]).getDate() <= 7 && (
                                    <span className="absolute -top-5 left-0 text-[9px] font-bold text-slate-300 whitespace-nowrap">
                                        {format(week[0], 'MMM', { locale: id })}
                                    </span>
                                )}
                            </div>
                            {week.map((day, di) => {
                                const key = format(day, 'yyyy-MM-dd');
                                const amount = savingsByDay[key] || 0;
                                const { bg } = getColor(amount);
                                const isToday = key === format(new Date(), 'yyyy-MM-dd');
                                return (
                                    <div
                                        key={key}
                                        title={`${format(day, 'd MMM yyyy', { locale: id })}: ${amount > 0 ? `Rp ${amount.toLocaleString('id-ID')}` : 'Tidak nabung'}`}
                                        className={`w-[18px] h-[18px] rounded-[4px] cursor-pointer transition-transform hover:scale-125 ${isToday ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
                                        style={{ backgroundColor: bg }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[9px] font-bold text-slate-300">Kurang</span>
                {['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#15803d'].map(c => (
                    <div key={c} className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: c }} />
                ))}
                <span className="text-[9px] font-bold text-slate-300">Banyak</span>
            </div>
        </div>
    );
}
