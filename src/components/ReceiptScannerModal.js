'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Camera, Upload, ScanLine, CheckCircle2, AlertCircle, RefreshCw, Loader2, ZoomIn } from 'lucide-react';

// ── Regex patterns ────────────────────────────────────────────────────────────
// Matches common Indonesian receipt / QRIS amount formats:
// e.g. "Total: Rp 1.500.000", "TOTAL 500000", "Jumlah 75.000"
const AMOUNT_PATTERNS = [
    /(?:total\s*(?:bayar|pembayaran|transfer)?|jumlah|nominal|amount|harga|tagihan|rp\.?)\s*[:\-]?\s*(?:rp\.?\s*)?([1-9]\d{0,2}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,})/gi,
    /rp\.?\s*([1-9]\d{0,2}(?:[.,]\d{3})+(?:[.,]\d{2})?)/gi,
    /([1-9]\d{0,2}(?:[.,]\d{3})+)\s*(?:,-|\.00)?/g,
];

function parseRupiahAmount(raw) {
    // Normalize: remove dots used as thousand-separators, keep comma as dec
    const cleaned = raw.replace(/\./g, '').replace(/,\d{2}$/, '').replace(/,/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
}

function extractAmountsFromText(text) {
    const candidates = new Set();
    for (const pattern of AMOUNT_PATTERNS) {
        let match;
        const re = new RegExp(pattern.source, pattern.flags);
        while ((match = re.exec(text)) !== null) {
            const raw = match[1] || match[0];
            const val = parseRupiahAmount(raw.replace(/\s/g, ''));
            if (val && val >= 1000 && val <= 999_999_999) {
                candidates.add(val);
            }
        }
    }
    // Return sorted descending — the largest is usually the grand total
    return Array.from(candidates).sort((a, b) => b - a);
}

export default function ReceiptScannerModal({ isOpen, onClose, onAmountDetected }) {
    const [phase, setPhase] = useState('idle'); // idle | preview | scanning | result | error
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [detectedAmounts, setDetectedAmounts] = useState([]);
    const [rawText, setRawText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const resetState = useCallback(() => {
        setPhase('idle');
        setImagePreview(null);
        setImageFile(null);
        setOcrProgress(0);
        setDetectedAmounts([]);
        setRawText('');
        setErrorMsg('');
        setIsZoomed(false);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleImageSelected = (file) => {
        if (!file) return;
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setPhase('preview');
    };

    const runOCR = useCallback(async () => {
        if (!imageFile) return;
        setPhase('scanning');
        setOcrProgress(0);

        try {
            // Dynamic import so Tesseract doesn't bloat the initial bundle
            const { createWorker } = await import('tesseract.js');

            const worker = await createWorker('ind+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                },
                // Use CDN for WASM/traineddata so we don't need local copies
                workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd.wasm.js',
            });

            const { data } = await worker.recognize(imageFile);
            await worker.terminate();

            const text = data.text || '';
            setRawText(text);

            const amounts = extractAmountsFromText(text);
            setDetectedAmounts(amounts);
            setPhase(amounts.length > 0 ? 'result' : 'error');

            if (amounts.length === 0) {
                setErrorMsg('Tidak ada nominal yang terdeteksi. Coba foto yang lebih jelas atau masukkan manual.');
            }
        } catch (err) {
            console.error('OCR error:', err);
            setPhase('error');
            setErrorMsg('Terjadi kesalahan saat memproses gambar. Coba lagi.');
        }
    }, [imageFile]);

    const handleSelectAmount = (amount) => {
        onAmountDetected(amount);
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[420px] mx-4 mb-6 bg-white rounded-[32px] shadow-2xl border border-white/40 overflow-hidden animate-[scaleIn_0.25s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-violet-50 via-blue-50 to-white pointer-events-none rounded-t-[32px]" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <ScanLine className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Scan Nota / QRIS</h2>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">OCR Otomatis</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 bg-white hover:bg-slate-100 hover:rotate-90 rounded-full text-slate-400 transition-all duration-300 shadow-sm border border-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-6">

                    {/* ── IDLE: Choose source ── */}
                    {phase === 'idle' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs text-slate-500 font-medium text-center mb-2">
                                Foto struk belanja, bukti transfer, atau QRIS — nominal akan terdeteksi otomatis ✨
                            </p>

                            {/* Camera */}
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-blue-50 border-2 border-dashed border-violet-200 rounded-2xl hover:border-violet-400 hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 text-sm">Ambil Foto Sekarang</p>
                                    <p className="text-[11px] text-slate-400 font-medium">Gunakan kamera HP-mu</p>
                                </div>
                            </button>

                            {/* Upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center gap-4 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-white hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-slate-300 group-hover:scale-110 transition-all">
                                    <Upload className="w-6 h-6 text-slate-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 text-sm">Pilih dari Galeri</p>
                                    <p className="text-[11px] text-slate-400 font-medium">JPEG, PNG, WebP didukung</p>
                                </div>
                            </button>

                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={e => handleImageSelected(e.target.files?.[0])}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageSelected(e.target.files?.[0])}
                            />

                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tips</span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: '💡', tip: 'Pencahayaan cukup' },
                                    { icon: '📐', tip: 'Nota lurus & rata' },
                                    { icon: '🔍', tip: 'Nominal terlihat jelas' },
                                    { icon: '📷', tip: 'Tidak buram / goyang' },
                                ].map(({ icon, tip }) => (
                                    <div key={tip} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                        <span className="text-sm">{icon}</span>
                                        <span className="text-[10px] font-semibold text-slate-500">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PREVIEW: Show image + Scan button ── */}
                    {phase === 'preview' && imagePreview && (
                        <div className="flex flex-col gap-4">
                            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50">
                                <img
                                    src={imagePreview}
                                    alt="Preview nota"
                                    className={`w-full object-contain transition-all duration-300 ${isZoomed ? 'max-h-72' : 'max-h-48'}`}
                                />
                                <button
                                    onClick={() => setIsZoomed(z => !z)}
                                    className="absolute bottom-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 shadow-sm"
                                >
                                    <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={resetState}
                                    className="py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Ganti Foto
                                </button>
                                <button
                                    onClick={runOCR}
                                    className="py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <ScanLine className="w-4 h-4" /> Scan Sekarang
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SCANNING: OCR in progress ── */}
                    {phase === 'scanning' && (
                        <div className="flex flex-col items-center gap-5 py-6">
                            {/* Animated scan lines */}
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                                </div>
                                {/* Scan beam */}
                                <div
                                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-[scanBeam_1.5s_ease-in-out_infinite]"
                                    style={{ top: `${ocrProgress}%` }}
                                />
                            </div>
                            <div className="text-center">
                                <p className="font-extrabold text-slate-700 text-base">Membaca nota...</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">Proses OCR sedang berjalan</p>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                />
                            </div>
                            <p className="text-xs font-black text-violet-600">{ocrProgress}%</p>
                        </div>
                    )}

                    {/* ── RESULT: Show detected amounts ── */}
                    {phase === 'result' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-xs font-bold text-emerald-700">
                                    {detectedAmounts.length} nominal terdeteksi — tap untuk pilih
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                                {detectedAmounts.map((amt, idx) => (
                                    <button
                                        key={amt}
                                        onClick={() => handleSelectAmount(amt)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                                            idx === 0
                                                ? 'bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200 shadow-sm'
                                                : 'bg-white border-slate-100 hover:border-violet-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                                                idx === 0 ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {idx === 0 ? '⭐' : idx + 1}
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-black tracking-tight text-sm ${idx === 0 ? 'text-violet-700' : 'text-slate-700'}`}>
                                                    Rp {amt.toLocaleString('id-ID')}
                                                </p>
                                                {idx === 0 && (
                                                    <p className="text-[10px] text-violet-400 font-semibold">Kemungkinan Total</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                            idx === 0 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            PILIH
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={resetState}
                                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Scan Ulang
                            </button>
                        </div>
                    )}

                    {/* ── ERROR ── */}
                    {phase === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-rose-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-700 text-sm">{errorMsg}</p>
                                {rawText && (
                                    <details className="mt-2 text-left">
                                        <summary className="text-[10px] text-slate-400 font-semibold cursor-pointer hover:text-slate-600">
                                            Lihat teks yang terdeteksi
                                        </summary>
                                        <pre className="mt-2 text-[9px] text-slate-500 bg-slate-50 rounded-xl p-3 max-h-28 overflow-y-auto whitespace-pre-wrap break-words font-mono leading-relaxed">
                                            {rawText}
                                        </pre>
                                    </details>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={resetState}
                                    className="py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-all"
                                >
                                    Isi Manual
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scanBeam {
                    0%, 100% { opacity: 0; top: 10%; }
                    50% { opacity: 1; top: 85%; }
                }
            `}</style>
        </div>
    );
}
