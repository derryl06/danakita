'use client';

import { useState } from 'react';
import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Github } from 'lucide-react';
import clsx from 'clsx';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        if (!auth) {
            setError('Konfigurasi Firebase belum terpasang. Jika di GitHub, pastikan sudah mengisi "Secrets".');
            return;
        }
        setLoading(true);
        setError(null);
        // ... rest of the code
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth) {
            setError('Konfigurasi Firebase tidak ditemukan.');
            return;
        }
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

                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <span className="relative bg-white px-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                            Atau lanjut dengan
                        </span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border border-slate-200 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 text-slate-600 text-sm disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        Google
                    </button>

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
