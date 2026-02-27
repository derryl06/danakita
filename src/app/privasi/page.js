'use client';

import TopBar from '../../components/TopBar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, Lock, Eye, Database, Share2 } from 'lucide-react';

export default function PrivasiPage() {
    const router = useRouter();

    return (
        <main className="flex-1 flex flex-col min-h-screen pb-24 bg-white">
            <TopBar
                title="Kebijakan Privasi"
                rightComponent={
                    <button onClick={() => router.back()} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                }
            />

            <div className="px-6 mt-8 flex-1 flex flex-col gap-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Privasi Anda, Prioritas Kami</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Terakhir diperbarui: 26 Februari 2026</p>
                </div>

                <div className="flex flex-col gap-8">
                    <section className="flex gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl h-fit text-blue-600 border border-slate-100">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Penyimpanan Data Lokal</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Dana Kita mengutamakan keamanan data finansial Anda. Semua data target, transaksi, dan pengaturan disimpan secara eksklusif di perangkat lokal Anda (**Local Storage**). Kami tidak mengirimkan data ini ke server eksternal kecuali Anda menggunakan fitur sinkronisasi pasangan.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl h-fit text-rose-500 border border-slate-100">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Koneksi Pasangan (Partner Sync)</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Saat Anda mengaktifkan fitur koneksi pasangan, data progres tabungan akan dibagikan dengan pasangan yang Anda hubungkan untuk memudahkan kolaborasi pencapaian target. Anda dapat memutuskan koneksi ini kapan saja.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl h-fit text-emerald-500 border border-slate-100">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Keamanan & Enkripsi</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Kami berkomitmen untuk melindungi informasi Anda dari akses yang tidak sah. Meskipun data disimpan secara lokal, kami menyarankan Anda menggunakan fitur keamanan bawaan perangkat (seperti PIN atau Biometrik) untuk mengunci akses ke aplikasi.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl h-fit text-amber-500 border border-slate-100">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Transparansi Harga Emas</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Fitur harga emas Antam bersifat referensi semata. Dana Kita tidak melakukan transaksi jual beli emas secara langsung. Silakan hubungi butik resmi atau platform terpercaya untuk melakukan transaksi riil.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-4 p-5 bg-blue-600 rounded-[28px] text-white shadow-xl shadow-blue-200">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-200" /> Komitmen Kami
                    </h4>
                    <p className="text-xs text-blue-50 leading-relaxed font-medium">
                        Dana Kita tidak akan pernah menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Privasi Anda adalah hak yang kami jaga sepenuhnya.
                    </p>
                </div>
            </div>
        </main>
    );
}
