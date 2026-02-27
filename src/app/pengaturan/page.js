'use client';

import TopBar from '../../components/TopBar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Shield, Moon, MonitorSmartphone, Landmark, Plus, Trash2, Loader2, Link2, Settings2, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { requestNotificationPermission, showNotification } from '../../utils/notifications';

export default function PengaturanPage() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dk_notifications_enabled');
        setNotifications(saved === 'true');
    }, []);

    const toggleNotifications = async () => {
        const newVal = !notifications;
        if (newVal) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotifications(true);
                localStorage.setItem('dk_notifications_enabled', 'true');
                showNotification('Notifikasi Aktif!', {
                    body: 'Kamu akan menerima pengingat harian untuk mencatat keuangan.'
                });
            } else {
                alert('Izin notifikasi ditolak oleh browser.');
            }
        } else {
            setNotifications(false);
            localStorage.setItem('dk_notifications_enabled', 'false');
        }
    };

    const handleBack = () => {
        router.push('/');
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] overflow-x-hidden">
            <TopBar
                title="Pengaturan"
                rightComponent={
                    <button onClick={handleBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col gap-6">


                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider">Tampilan</h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">

                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <Moon className="w-5 h-5 text-indigo-500" />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Mode Gelap</span>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <MonitorSmartphone className="w-5 h-5 text-indigo-500" />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Ikuti Sistem</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Aktif</span>
                        </div>

                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider">Notifikasi & Privasi</h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">

                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <Bell className="w-5 h-5 text-rose-500" />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Notifikasi Pengingat</span>
                            </div>
                            <button
                                onClick={toggleNotifications}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${notifications ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div
                            onClick={() => router.push('/privasi')}
                            className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <Shield className="w-5 h-5 text-slate-600" />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Kebijakan Privasi</span>
                            </div>
                        </div>

                    </div>
                </section>

                <button className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-[16px] border border-red-100 hover:bg-red-100 transition-colors mt-4">
                    Hapus Semua Data
                </button>

            </div>
        </main>
    );
}
