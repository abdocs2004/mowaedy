import { EmptyState, ErrorState, Skeleton } from './Feedback.jsx';
import { Inbox } from 'lucide-react';

/**
 * columns: [{ key, header, render?(row), className?, hideBelow?: 'md'|'lg' }]
 * The table scrolls inside its own container on small screens (page body never scrolls sideways).
 */
export function DataTable({ columns, rows, loading, error, onRetry, empty, rowKey = '_id', dense = false }) {
  const hide = (c) => (c.hideBelow === 'md' ? 'hidden md:table-cell' : c.hideBelow === 'lg' ? 'hidden lg:table-cell' : '');
  if (error && !rows) return <ErrorState error={error} onRetry={onRetry} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-start text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-ink-muted">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={`whitespace-nowrap px-4 py-3 text-start ${hide(c)} ${c.className || ''}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && !rows && Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className={`px-4 py-4 ${hide(c)}`}><Skeleton className="h-5 w-full max-w-[9rem]" /></td>)}</tr>
          ))}
          {(rows || []).map((row) => (
            <tr key={row[rowKey]} className={`transition-colors hover:bg-slate-50/70 ${loading ? 'opacity-60' : ''}`}>
              {columns.map((c) => <td key={c.key} className={`px-4 ${dense ? 'py-2.5' : 'py-3.5'} align-middle text-ink-soft ${hide(c)} ${c.className || ''}`}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows?.length === 0 && (empty || <EmptyState icon={Inbox} title="لا توجد بيانات" description="لم يتم العثور على نتائج مطابقة." />)}
    </div>
  );
}
