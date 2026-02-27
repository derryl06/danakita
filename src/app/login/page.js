'use client';

import { useState } from 'react';
import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                router.push('/');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                router.push('/');
            }
        } catch (err) {
            let msg = err.message;
            if (err.code === 'auth/user-not-found') msg = 'Email tidak terdaftar';
            if (err.code === 'auth/wrong-password') msg = 'Password salah';
            if (err.code === 'auth/email-already-in-use') msg = 'Email sudah digunakan';
            if (err.code === 'auth/weak-password') msg = 'Password terlalu lemah (min 6 karakter)';
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => router.push('/')}
                        className="absolute -top-4 -left-4 p-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                        ← Kembali
                    </button>

                    <div className="flex flex-col items-center mb-8 mt-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-200 rotate-3 group hover:rotate-0 transition-transform duration-500">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dana Kita</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">
                            {isLogin ? 'Masuk ke akun kamu' : 'Daftar akun baru'}
                        </p>
                    </div>

                    <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={clsx(
                                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                                isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                            )}
                        >
                            Masuk
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={clsx(
                                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                                !isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                            )}
                        >
                            Daftar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Alamat Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[10px] text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 leading-tight">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {isLogin ? 'Masuk Sekarang' : 'Buat Akun Sekarang'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full mt-6 text-slate-400 hover:text-indigo-600 font-bold text-xs transition-colors"
                    >
                        Lanjut sebagai Tamu
                    </button>
                </div>
            </div>
        </main>
    );
}
