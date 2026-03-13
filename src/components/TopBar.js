export default function TopBar({ title, subtitle, rightComponent }) {
    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-5 pt-12 pb-4 bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-xl border-b border-white/40 dark:border-slate-700/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] w-full transition-all duration-300">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black bg-gradient-to-r from-[var(--color-primary)] to-blue-500 bg-clip-text text-transparent tracking-tighter">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs font-medium text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {rightComponent && (
                <div className="flex items-center">
                    {rightComponent}
                </div>
            )}
        </header>
    );
}
