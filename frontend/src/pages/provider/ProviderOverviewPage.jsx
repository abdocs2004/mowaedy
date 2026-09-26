import { Link } from 'react-router-dom';
import { CalendarClock, CalendarDays, ListChecks, Wallet } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard.jsx';
import { TrendChart } from '../../components/shared/Charts.jsx';
import { EmptyState, ErrorState, LinkButton, Skeleton, StatusBadge } from '../../components/ui/index.js';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { formatDateTime, formatPrice } from '../../lib/format.js';

export default function ProviderOverviewPage() {
  const { data, loading, error, reload } = useFetch((signal) => api.get('/provider/stats', { signal }));
  if (loading && !data) return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="مواعيد اليوم" value={data.totals.today} tone="blue" />
        <StatCard icon={ListChecks} label="إجمالي المواعيد" value={data.totals.appointments} tone="purple" />
        <StatCard icon={Wallet} label="إجمالي الإيرادات" value={formatPrice(data.totals.revenue)} tone="green" hint="من المواعيد المكتملة" />
        <StatCard icon={CalendarClock} label="قيد الانتظار" value={data.byStatus.pending} tone="amber" />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-bold">نشاط آخر 14 يوماً</h2>
        <TrendChart data={data.series} height={260} />
      </div>

      <div className="card">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-base font-bold">المواعيد القادمة</h2><Link to="/provider/appointments" className="text-sm font-semibold text-primary-700 hover:underline">عرض الكل</Link></header>
        {data.upcoming.length === 0 ? <EmptyState icon={CalendarDays} title="لا توجد مواعيد قادمة" className="py-10" /> : (
          <ul className="divide-y divide-slate-100">
            {data.upcoming.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0"><p className="truncate font-semibold text-ink">{a.customer?.name}</p><p className="text-xs text-ink-muted">{a.service?.name}</p></div>
                <div className="flex items-center gap-3"><span className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(a.startAt)}</span><StatusBadge status={a.status} /></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
