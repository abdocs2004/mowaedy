import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../lib/format.js';

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, 2, pages - 1, pages, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return list.flatMap((n, i) => (i && n - list[i - 1] > 1 ? ['…', n] : [n]));
}

/** RTL-aware: "previous" points right, "next" points left. */
export function Pagination({ meta, onChange, className = '' }) {
  if (!meta || meta.pages <= 1) return meta?.total ? <p className={`text-sm text-ink-muted ${className}`}>{formatNumber(meta.total)} نتيجة</p> : null;
  const { page, pages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors';
  return (
    <nav className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`} aria-label="التنقل بين الصفحات">
      <p className="text-sm text-ink-muted">عرض {formatNumber(from)}–{formatNumber(to)} من {formatNumber(total)}</p>
      <div className="flex items-center gap-1">
        <button className={`${btn} text-ink-soft hover:bg-slate-100 disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="الصفحة السابقة"><ChevronRight className="h-4 w-4" /></button>
        {pageList(page, pages).map((n, i) => n === '…'
          ? <span key={`d${i}`} className="px-1 text-slate-400">…</span>
          : <button key={n} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
              className={`${btn} ${n === page ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-slate-100'}`}>{formatNumber(n)}</button>)}
        <button className={`${btn} text-ink-soft hover:bg-slate-100 disabled:opacity-40`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="الصفحة التالية"><ChevronLeft className="h-4 w-4" /></button>
      </div>
    </nav>
  );
}
