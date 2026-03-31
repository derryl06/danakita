'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, RefreshCw, Info } from 'lucide-react';

// Detect bank format and parse CSV rows into transactions
function detectAndParse(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { rows: [], bank: 'Unknown' };

    // Try to find header row
    const header = lines[0].toLowerCase();
    const rows = [];
    let bank = 'CSV Umum';

    // BCA format: Tanggal, Keterangan, Cabang, Jumlah, Saldo
    if (header.includes('keterangan') && header.includes('saldo')) {
        bank = 'BCA';
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/[,;|\t]/);
            if (cols.length < 4) continue;
            const dateStr = cols[0]?.trim();
            const desc = cols[1]?.trim() || cols[2]?.trim() || '';
            const rawAmt = (cols[3] || cols[4] || '').replace(/[^0-9.,]/g, '');
            const amount = parseIDRAmount(rawAmt);
            if (amount > 0 && dateStr) {
                // Detect debit vs credit from next column or description
                const isCredit = /cr|kredit|masuk|in/i.test(cols[4] || '');
                rows.push({ date: parseDate(dateStr), note: desc, amount, type: isCredit ? 'in' : 'out' });
            }
        }
        return { rows, bank };
    }

    // Mandiri / Generic format: try to find amount columns
    for (let i = 1; i < Math.min(lines.length, 200); i++) {
        const cols = lines[i].split(/[,;|\t]/);
        if (cols.length < 2) continue;
        // Find the largest number in the row — likely the amount
        let largestAmt = 0, largestIdx = -1;
        cols.forEach((c, idx) => {
            const n = parseIDRAmount(c.replace(/[^0-9.,]/g, ''));
            if (n > largestAmt) { largestAmt = n; largestIdx = idx; }
        });
        if (largestAmt >= 100 && largestIdx !== -1) {
            const dateStr = cols[0]?.trim();
            const desc = cols.find((c, idx) => idx !== 0 && idx !== largestIdx && c.trim().length > 3) || '';
            rows.push({
                date: parseDate(dateStr),
                note: desc.trim(),
                amount: largestAmt,
                type: 'in', // default, user can change
            });
        }
    }
    return { rows, bank };
}

function parseIDRAmount(raw) {
    if (!raw) return 0;
    // Handle 1.234.567 format (dots as thousands separator)
    const cleaned = raw.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : Math.round(n);
}

function parseDate(raw) {
    if (!raw) return new Date().toISOString();
    // Try dd/mm/yyyy or dd-mm-yyyy
    const m = raw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`).toISOString();
    // Try yyyy-mm-dd
    const m2 = raw.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (m2) return new Date(raw).toISOString();
    return new Date().toISOString();
}

export default function CSVImporter({ isOpen, onClose, onImport }) {
    const [phase, setPhase] = useState('idle'); // idle | parsed | importing | done
    const [rows, setRows] = useState([]);
    const [bank, setBank] = useState('');
    const [selected, setSelected] = useState({});
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const fileRef = useRef(null);

    const reset = () => { setPhase('idle'); setRows([]); setBank(''); setSelected({}); setError(''); setFileName(''); };
    const handleClose = () => { reset(); onClose(); };

    const handleFile = (file) => {
        if (!file) return;
        setFileName(file.name);
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'txt'].includes(ext)) { setError('Hanya file .csv atau .txt yang didukung'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const { rows: parsed, bank: detectedBank } = detectAndParse(e.target.result);
                if (parsed.length === 0) { setError('Tidak ada transaksi yang terdeteksi. Coba format CSV lain.'); return; }
                const sel = {};
                parsed.forEach((_, i) => { sel[i] = true; });
                setRows(parsed);
                setBank(detectedBank);
                setSelected(sel);
                setPhase('parsed');
                setError('');
            } catch (err) {
                setError('Gagal memproses file. Pastikan format benar.');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleImport = () => {
        const toImport = rows.filter((_, i) => selected[i]);
        if (toImport.length === 0) { setError('Pilih minimal 1 transaksi'); return; }
        onImport(toImport);
        setPhase('done');
    };

    const toggleAll = (val) => {
        const s = {};
        rows.forEach((_, i) => { s[i] = val; });
        setSelected(s);
    };

    const selectedCount = Object.values(selected).filter(Boolean).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="w-full max-w-[420px] mx-4 mb-6 bg-white rounded-[32px] shadow-2xl overflow-hidden animate-[scaleIn_0.25s_ease-out]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-emerald-50 via-teal-50 to-white pointer-events-none rounded-t-[32px]" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <FileSpreadsheet className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">Import CSV Bank</h2>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{bank || 'Mutasi Rekening'}</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-white hover:bg-slate-100 hover:rotate-90 rounded-full text-slate-400 transition-all duration-300 shadow-sm border border-slate-100">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-24 max-h-[70vh] overflow-y-auto shadow-inner">
                    {/* IDLE */}
                    {phase === 'idle' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                    <p className="font-bold mb-1">Format yang didukung:</p>
                                    <p>• BCA — Export CSV dari onlineBCA</p>
                                    <p>• Mandiri — Mutasi rekening .csv</p>
                                    <p>• CSV umum dengan kolom tanggal, deskripsi, nominal</p>
                                </div>
                            </div>

                            <button onClick={() => fileRef.current?.click()}
                                className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-200 rounded-2xl hover:border-emerald-400 transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700">Pilih File CSV</p>
                                    <p className="text-[11px] text-slate-400">.csv atau .txt dari export bank</p>
                                </div>
                            </button>
                            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                            {error && <p className="text-rose-500 text-xs font-medium text-center">{error}</p>}
                        </div>
                    )}

                    {/* PARSED */}
                    {phase === 'parsed' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500">{fileName}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">{rows.length} transaksi ditemukan dari {bank}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleAll(true)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100">Pilih Semua</button>
                                    <button onClick={() => toggleAll(false)} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200">Batal</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                                {rows.map((row, i) => (
                                    <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected[i] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200 opacity-60'}`}>
                                        <input type="checkbox" checked={!!selected[i]} onChange={() => setSelected(s => ({ ...s, [i]: !s[i] }))} className="rounded" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-slate-600 truncate">{row.note || '(Tidak ada keterangan)'}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                        <span className={`text-[11px] font-black shrink-0 ${row.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {row.type === 'in' ? '+' : '-'}Rp {Number(row.amount).toLocaleString('id-ID')}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {error && <p className="text-rose-500 text-xs font-medium text-center">{error}</p>}

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={reset} className="py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Ganti File
                                </button>
                                <button onClick={handleImport}
                                    className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                    Import {selectedCount} Transaksi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DONE */}
                    {phase === 'done' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-700 text-base">Import Berhasil!</p>
                                <p className="text-xs text-slate-400 mt-1">{selectedCount} transaksi berhasil diimport ke riwayat</p>
                            </div>
                            <button onClick={handleClose} className="w-full py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-all">
                                Selesai
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
