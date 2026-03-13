'use client';

import TopBar from '../../components/TopBar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Shield, Moon, MonitorSmartphone, Wallet, Trash2, Trophy, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { getUnlockedAchievements, ACHIEVEMENTS } from '../../components/Gamification';
import { requestNotificationPermission, showNotification } from '../../utils/notifications';

export default function PengaturanPage() {
    const router = useRouter();
    const {
        isDarkMode, toggleDarkMode,
        monthlyBudget, updateMonthlyBudget,
        targets, transactions, clearData,
        completeOnboarding
    } = useAppContext();
    const { addToast } = useToast();

    const [notifications, setNotifications] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showResetOnboarding, setShowResetOnboarding] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('dk_notifications_enabled');
        setNotifications(saved === 'true');
        if (monthlyBudget > 0) setBudgetInput(monthlyBudget.toString());
    }, [monthlyBudget]);

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
                addToast('Notifikasi berhasil diaktifkan', 'success');
            } else {
                addToast('Izin notifikasi ditolak oleh browser', 'error');
            }
        } else {
            setNotifications(false);
            localStorage.setItem('dk_notifications_enabled', 'false');
            addToast('Notifikasi dinonaktifkan', 'info');
        }
    };

    const handleSaveBudget = () => {
        const amount = Number(budgetInput) || 0;
        updateMonthlyBudget(amount);
        addToast(amount > 0 ? `Anggaran bulanan diset Rp ${amount.toLocaleString('id-ID')}` : 'Anggaran bulanan dihapus', 'success');
    };

    const handleBack = () => {
        router.push('/');
    };

    const handleClearData = () => {
        clearData();
        addToast('Semua data berhasil dihapus', 'info');
    };

    const handleResetOnboarding = () => {
        localStorage.removeItem('dk_onboarding_seen');
        addToast('Onboarding akan tampil saat reload', 'info');
    };

    // Achievements
    const unlocked = getUnlockedAchievements(targets, transactions);
    const locked = ACHIEVEMENTS.filter(a => !unlocked.find(u => u.id === a.id));

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)] overflow-x-hidden page-transition">
            <TopBar
                title="Pengaturan"
                rightComponent={
                    <button onClick={handleBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col gap-6">

                {/* Tampilan */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider">Tampilan</h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">

                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <Moon className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-[var(--color-text-primary)] block">Mode Gelap</span>
                                    <span className="text-[10px] text-slate-400">{isDarkMode ? 'Aktif' : 'Nonaktif'}</span>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <MonitorSmartphone className="w-5 h-5 text-indigo-500" />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Ikuti Sistem</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Auto</span>
                        </div>

                    </div>
                </section>

                {/* Anggaran Bulanan */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider">Anggaran Bulanan</h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-[14px]">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)] block">Target Nabung/Bulan</span>
                                <span className="text-[10px] text-slate-400">Tampil di beranda sebagai progress bar</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rp</span>
                                <input
                                    type="number"
                                    value={budgetInput}
                                    onChange={e => setBudgetInput(e.target.value)}
                                    placeholder="0"
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSaveBudget}
                                className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                            >
                                Simpan
                            </button>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {[500000, 1000000, 2000000, 5000000].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setBudgetInput(val.toString())}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${Number(budgetInput) === val ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                                >
                                    {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Notifikasi & Privasi */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider">Notifikasi & Privasi</h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">

                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-[14px]">
                                    <Bell className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-[var(--color-text-primary)] block">Notifikasi Pengingat</span>
                                    <span className="text-[10px] text-slate-400">Pengingat harian untuk mencatat</span>
                                </div>
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

                {/* Achievements */}
                <section>
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" /> Pencapaian
                    </h3>
                    <div className="w-full bg-white rounded-[24px] border border-[var(--color-border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5">
                        <div className="flex flex-wrap gap-3">
                            {unlocked.map(a => (
                                <div key={a.id} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2 shadow-sm">
                                    <span className="text-lg">{a.icon}</span>
                                    <div>
                                        <span className="text-[10px] font-black text-amber-800 block">{a.name}</span>
                                        <span className="text-[8px] font-medium text-amber-600">{a.desc}</span>
                                    </div>
                                </div>
                            ))}
                            {locked.map(a => (
                                <div key={a.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 opacity-40">
                                    <span className="text-lg grayscale">🔒</span>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 block">{a.name}</span>
                                        <span className="text-[8px] font-medium text-slate-400">{a.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {unlocked.length === 0 && (
                            <p className="text-xs text-slate-400 text-center mt-2">Belum ada pencapaian. Mulai menabung!</p>
                        )}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="flex flex-col gap-3">
                    <button
                        onClick={() => setShowResetOnboarding(true)}
                        className="w-full bg-slate-50 text-slate-600 font-bold py-4 rounded-[16px] border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset Tutorial
                    </button>
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-[16px] border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Hapus Semua Data
                    </button>
                </section>

            </div>

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearData}
                title="Hapus Semua Data?"
                message="Semua target, transaksi, dan pengaturan akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus Semua"
                type="danger"
            />

            <ConfirmModal
                isOpen={showResetOnboarding}
                onClose={() => setShowResetOnboarding(false)}
                onConfirm={handleResetOnboarding}
                title="Reset Tutorial?"
                message="Tutorial onboarding akan ditampilkan kembali saat halaman dimuat ulang."
                confirmText="Reset"
                type="info"
            />
        </main>
    );
}
