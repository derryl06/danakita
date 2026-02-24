'use client';

import TopBar from '../../components/TopBar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';

export default function BantuanPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const faqs = [
        { q: "Bagaimana cara mencatat tabungan?", a: "Pilih menu Tambah di bagian bawah aplikasi, lalu pilih target tabungan dan masukkan nominalnya." },
        { q: "Apakah data saya aman?", a: "Ya, untuk saat ini data hanya disimpan pada perangkat lokal Anda (belum tersinkron dengan server)." },
        { q: "Bisa tambah kategori baru?", a: "Saat ini kategori sudah disesuaikan default untuk memudahkan pengelolaan dana general. Penambahan custom kategori akan hadir pada versi selanjutnya." }
    ];

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-[var(--color-bg-secondary)]">
            <TopBar
                title="Pusat Bantuan"
                rightComponent={
                    <button onClick={handleBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-5 mt-6 flex-1 flex flex-col gap-6">

                <div className="bg-gradient-to-r from-blue-600 to-[var(--color-primary)] rounded-[24px] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <HelpCircle className="w-32 h-32 absolute -right-6 -bottom-6 text-white/10" />
                    <h3 className="font-extrabold text-xl mb-2 relative z-10">Ada kendala?</h3>
                    <p className="text-sm text-blue-100 mb-6 relative z-10 w-4/5">Tim kami siap membantu menyelesaikan masalah Anda kapan saja.</p>

                    <div className="flex gap-3 relative z-10">
                        <button className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                            <MessageCircle className="w-4 h-4" /> Live Chat
                        </button>
                        <button className="flex-1 bg-blue-700/50 text-white border border-white/20 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                            <Mail className="w-4 h-4" /> Email
                        </button>
                    </div>
                </div>

                <section className="mt-2">
                    <h3 className="text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-wider">Pertanyaan Umum (FAQ)</h3>

                    <div className="flex flex-col gap-3">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-sm cursor-pointer group hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="p-2 bg-slate-50 text-[var(--color-primary)] rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{faq.q}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
