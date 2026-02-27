export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('Browser tidak mendukung notifikasi');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
        const defaultOptions = {
            icon: '/danakita/globe.svg',
            badge: '/danakita/globe.svg',
            ...options
        };

        // Try using Service Worker for better reliability on mobile
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, defaultOptions);
            });
        } else {
            new Notification(title, defaultOptions);
        }
    }
};

// Simple scheduler logic (needs to be called in layout or app context to persist)
export const checkAndShowReminder = () => {
    const lastReminder = localStorage.getItem('dk_last_reminder');
    const today = new Date().toDateString();

    if (lastReminder !== today) {
        showNotification('Sudah Catat Keuangan Hari Ini?', {
            body: 'Jangan lupa catat transaksi kamu di Dana Kita agar tabunganmu terkontrol!',
            tag: 'daily-reminder'
        });
        localStorage.setItem('dk_last_reminder', today);
    }
};
