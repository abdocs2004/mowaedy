import { AlertCircle, Inbox, Loader2, RefreshCw, Star, StarHalf } from 'lucide-react';
import { STATUS } from '../../lib/format.js';
import { Button } from './Button.jsx';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-primary-600 ${className}`} aria-hidden />;
}

export function PageLoader({ label = 'جارٍ التحميل…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-muted" role="status">
      <Spinner className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden />;

export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon className="h-8 w-8" aria-hidden /></span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`} role="alert">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500"><AlertCircle className="h-8 w-8" aria-hidden /></span>
      <h3 className="text-lg font-bold text-ink">تعذّر تحميل البيانات</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">{error?.message || 'حدث خطأ غير متوقع'}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}><RefreshCw className="h-4 w-4" /> إعادة المحاولة</Button>}
    </div>
  );
}

const TONES = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
};
const DOTS = { gray: 'bg-slate-400', blue: 'bg-blue-500', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', purple: 'bg-violet-500' };

export function Badge({ tone = 'gray', dot = false, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, tone: 'gray' };
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function Stars({ value = 0, count, size = 'h-4 w-4', showValue = false }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`التقييم ${value} من 5`}>
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) =>
          i < full ? <Star key={i} className={`${size} fill-amber-400 text-amber-400`} />
            : i === full && half ? <StarHalf key={i} className={`${size} fill-amber-400 text-amber-400`} />
              : <Star key={i} className={`${size} text-slate-300`} />
        )}
      </span>
      {showValue && <span className="text-sm font-bold text-ink">{Number(value).toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-ink-muted">({count})</span>}
    </span>
  );
}

/** Image with a graceful initials fallback. */
export function Avatar({ src, name = '', className = 'h-10 w-10', rounded = 'rounded-full' }) {
  return src ? (
    <img src={src} alt="" loading="lazy" className={`${className} ${rounded} bg-slate-200 object-cover`} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
  ) : (
    <span className={`${className} ${rounded} inline-flex items-center justify-center bg-primary-100 text-sm font-bold text-primary-700`} aria-hidden>{name.trim()[0] || '؟'}</span>
  );
}

export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 ${className}`}>
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${value === t.value ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-muted hover:text-ink'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
