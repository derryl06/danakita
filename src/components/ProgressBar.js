export default function ProgressBar({ progress }) {
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
            <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-blue-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${safeProgress}%` }}
            >
                <div className="absolute inset-0 bg-white/20 w-full h-full opacity-0 hover:opacity-100 transition-opacity"></div>
                {/* subtle highlight at right edge */}
                {safeProgress > 0 && <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/30 to-transparent"></div>}
            </div>
        </div>
    );
}
