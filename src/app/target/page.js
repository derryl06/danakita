'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import GoalCard from '../../components/GoalCard';
import { z } from 'zod';
import { Plus, X, ChevronDown, ChevronRight, Tags } from 'lucide-react';

const targetSchema = z.object({
    name: z.string().min(1, 'Nama target wajib diisi'),
    category: z.string().min(1, 'Kategori wajib diisi'),
    target_amount: z.number().min(1000, 'Minimal Rp 1.000'),
    deadline: z.string().min(1, 'Deadline wajib diisi'),
    current_amount: z.number().min(0, 'Tabungan tidak boleh negatif'),
});

export default function TargetPage() {
    const { targets, addTarget, deleteTarget, updateTarget } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [editingTargetId, setEditingTargetId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        target_amount: '',
        deadline: '',
        current_amount: '',
    });

    const [errors, setErrors] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    const groupedTargets = targets.reduce((acc, target) => {
        const cat = target.category || 'Lainnya';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(target);
        return acc;
    }, {});

    const handleEdit = (id) => {
        const target = targets.find(t => t.id === id);
        if (target) {
            setFormData({
                name: target.name,
                category: target.category,
                target_amount: target.target_amount.toString(),
                deadline: target.deadline || '',
                current_amount: target.current_amount.toString()
            });
            setEditingTargetId(id);
            setIsAdding(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const parsedData = targetSchema.parse({
                name: formData.name,
                category: formData.category,
                target_amount: Number(formData.target_amount) || 0,
                deadline: formData.deadline,
                current_amount: Number(formData.current_amount) || 0,
            });

            if (editingTargetId) {
                updateTarget(editingTargetId, parsedData);
            } else {
                addTarget({
                    id: Math.random().toString(36).substr(2, 9),
                    ...parsedData,
                });
            }

            setIsAdding(false);
            setEditingTargetId(null);
            setFormData({
                name: '',
                category: '',
                target_amount: '',
                deadline: '',
                current_amount: '',
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors = {};
                err.errors.forEach(error => {
                    if (error.path[0]) {
                        fieldErrors[error.path[0]] = error.message;
                    }
                });
                setErrors(fieldErrors);
            }
        }
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)]">
            <TopBar title="Target Tabungan" />

            <div className="px-5 mt-6 flex-1 flex flex-col">
                {isAdding ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-[24px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 mb-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100/50">
                            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                                {editingTargetId ? 'Edit Target' : 'Buat Target Baru'}
                            </h2>
                            <button onClick={() => { setIsAdding(false); setEditingTargetId(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:rotate-90 rounded-full transition-all duration-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 ml-1">Nama Target</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                    placeholder="Contoh: Dana Pendidikan"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 ml-1">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="General">Umum</option>
                                    <option value="Menikah">Menikah</option>
                                    <option value="Pendidikan">Pendidikan</option>
                                    <option value="Rumah">Isi Rumah</option>
                                    <option value="Darurat">Dana Darurat</option>
                                </select>
                                {errors.category && <p className="text-red-500 text-xs mt-1 ml-1">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 ml-1">Target Nominal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">Rp</span>
                                    <input
                                        type="number"
                                        value={formData.target_amount}
                                        onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="Berapa yang ingin dikumpulkan?"
                                    />
                                </div>
                                {errors.target_amount && <p className="text-red-500 text-xs mt-1 ml-1">{errors.target_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 ml-1">Tabungan Saat Ini</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">Rp</span>
                                    <input
                                        type="number"
                                        value={formData.current_amount}
                                        onChange={e => setFormData({ ...formData, current_amount: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="Sudah terkumpul berapa?"
                                    />
                                </div>
                                {errors.current_amount && <p className="text-red-500 text-xs mt-1 ml-1">{errors.current_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 ml-1">Deadline</label>
                                <input
                                    type="month"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                />
                                {errors.deadline && <p className="text-red-500 text-xs mt-1 ml-1">{errors.deadline}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white py-4 rounded-[16px] font-bold mt-4 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] group"
                            >
                                Simpan Target <span className="inline-block group-hover:scale-110 group-hover:translate-x-1 ml-1 transition-transform">✨</span>
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full bg-slate-50/50 border-2 border-dashed border-slate-200 text-slate-500 py-5 rounded-[24px] font-semibold mb-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 active:scale-[0.98] group"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                                <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            Buat Target Baru
                        </button>

                        <div className="flex flex-col gap-4">
                            {targets.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-semibold text-slate-700 mb-1">Belum ada target</h3>
                                    <p className="text-slate-500 text-sm text-center max-w-[200px]">Mulai rencanakan masa depanmu dengan membuat target tabungan pertamamu.</p>
                                </div>
                            ) : (
                                Object.keys(groupedTargets).map(category => (
                                    <div key={category} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full px-5 py-4 flex justify-between items-center bg-slate-50/50 hover:bg-blue-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-[var(--color-primary)]">
                                                    <Tags className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-bold text-[var(--color-text-primary)] text-sm">{category}</span>
                                                    <span className="text-xs text-slate-500">{groupedTargets[category].length} Target Tabungan</span>
                                                </div>
                                            </div>
                                            {expandedCategories[category] ? (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
                                            )}
                                        </button>

                                        {expandedCategories[category] && (
                                            <div className="p-4 flex flex-col gap-4 border-t border-slate-100 bg-slate-50/20">
                                                {groupedTargets[category].map(target => (
                                                    <GoalCard
                                                        key={target.id}
                                                        id={target.id}
                                                        name={target.name}
                                                        category={target.category}
                                                        currentAmount={target.current_amount}
                                                        targetAmount={target.target_amount}
                                                        deadline={target.deadline}
                                                        status={target.current_amount >= target.target_amount ? 'Tercapai 🎉' : 'On track'}
                                                        statusType={target.current_amount >= target.target_amount ? 'success' : 'success'}
                                                        onDelete={deleteTarget}
                                                        onEdit={handleEdit}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
