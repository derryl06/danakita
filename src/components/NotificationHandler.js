'use client';

import { useEffect } from 'react';
import { checkAndShowReminder } from '../utils/notifications';

export default function NotificationHandler() {
    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            const enabled = localStorage.getItem('dk_notifications_enabled');
            if (enabled === 'true') {
                const timer = setTimeout(() => {
                    checkAndShowReminder();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    return null;
}
