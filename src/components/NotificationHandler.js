'use client';

import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { checkAndShowReminder, showNotification } from '../utils/notifications';

export default function NotificationHandler() {
    const { targets, transactions } = useAppContext();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const enabled = localStorage.getItem('dk_notifications_enabled');
        if (enabled !== 'true') return;

        // Daily reminder
        const dailyTimer = setTimeout(() => {
            checkAndShowReminder();
        }, 3000);

        // Check for approaching deadlines
        const deadlineTimer = setTimeout(() => {
            const lastDeadlineCheck = localStorage.getItem('dk_last_deadline_check');
            const today = new Date().toDateString();

            if (lastDeadlineCheck !== today && targets.length > 0) {
                targets.forEach(target => {
                    if (!target.deadline) return;
                    const deadlineDate = new Date(target.deadline);
                    const now = new Date();
                    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

                    if (daysLeft > 0 && daysLeft <= 30) {
                        showNotification(`⏰ Deadline "${target.name}" mendekat!`, {
                            body: `Tersisa ${daysLeft} hari lagi. Progres: ${target.target_amount > 0 ? Math.round((target.current_amount / target.target_amount) * 100) : 0}%`,
                            tag: `deadline-${target.id}`
                        });
                    }
                });
                localStorage.setItem('dk_last_deadline_check', today);
            }
        }, 5000);

        // Check for inactivity (no savings in X days)
        const inactivityTimer = setTimeout(() => {
            const lastInactivityCheck = localStorage.getItem('dk_last_inactivity_check');
            const today = new Date().toDateString();

            if (lastInactivityCheck !== today && transactions.length > 0) {
                const lastSaving = transactions.find(tx => tx.type === 'in');
                if (lastSaving && lastSaving.date) {
                    const daysSinceLastSaving = Math.ceil((new Date() - new Date(lastSaving.date)) / (1000 * 60 * 60 * 24));

                    if (daysSinceLastSaving >= 7) {
                        showNotification(`💭 Sudah ${daysSinceLastSaving} hari belum menabung`, {
                            body: 'Jangan putus streak-mu! Catat tabungan hari ini di Dana Kita.',
                            tag: 'inactivity-reminder'
                        });
                    }
                }
                localStorage.setItem('dk_last_inactivity_check', today);
            }
        }, 8000);

        return () => {
            clearTimeout(dailyTimer);
            clearTimeout(deadlineTimer);
            clearTimeout(inactivityTimer);
        };
    }, [targets, transactions]);

    return null;
}
