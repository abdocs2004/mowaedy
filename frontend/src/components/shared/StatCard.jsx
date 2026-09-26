export function StatCard({ icon: Icon, label, value, tone = 'blue', hint }) {
  const tones = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600', purple: 'bg-violet-50 text-violet-600', slate: 'bg-slate-100 text-slate-600' };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-6 w-6" aria-hidden /></span>
      <div className="min-w-0"><p className="truncate text-sm text-ink-muted">{label}</p><p className="text-2xl font-extrabold text-ink">{value}</p>{hint && <p className="text-xs text-ink-muted">{hint}</p>}</div>
    </div>
  );
}

export function Panel({ title, action, children, className = '', padded = true }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><h2 className="text-base font-bold text-ink">{title}</h2>{action}</header>}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}
