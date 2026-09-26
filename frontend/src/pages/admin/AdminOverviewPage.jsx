import { Link } from 'react-router-dom';
import { CalendarDays, MessageSquare, Store, Users, Wallet } from 'lucide-react';
import { CategoryBars, StatusDonut, TrendChart } from '../../components/shared/Charts.jsx';
import { StatCard } from '../../components/shared/StatCard.jsx';
import { Avatar, EmptyState, ErrorState, Skeleton, StatusBadge } from '../../components/ui/index.js';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { STATUS, formatDateTime, formatNumber, formatPrice } from '../../lib/format.js';

export default function AdminOverviewPage() {
  const { data, loading, error, reload } = useFetch((signal) => api.get('/admin/stats', { signal }));
  if (loading && !data) return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="العملاء" value={formatNumber(totals.users)} tone="blue" />
        <StatCard icon={Store} label="مقدمو الخدمة" value={formatNumber(totals.providers)} hint={`${totals.activeProviders} نشط`} tone="purple" />
        <StatCard icon={CalendarDays} label="إجمالي المواعيد" value={formatNumber(totals.appointments)} tone="amber" />
        <StatCard icon={Wallet} label="الإيرادات" value={formatPrice(totals.revenue)} tone="green" hint="من المواعيد المكتملة" />
        <Link to="/admin/messages"><StatCard icon={MessageSquare} label="رسائل غير مقروءة" value={formatNumber(totals.unreadMessages)} tone={totals.unreadMessages ? 'red' : 'slate'} /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">نشاط آخر 30 يوماً</h2>
          <TrendChart data={data.series} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold">توزيع الحالات</h2>
          <StatusDonut byStatus={data.byStatus} labels={Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, v.label]))} />
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data.byStatus).map(([k, v]) => <li key={k} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-1.5"><StatusBadge status={k} /><b>{formatNumber(v)}</b></li>)}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">المواعيد حسب القسم</h2>
          <CategoryBars data={data.byCategory.map((c) => ({ name: c.name, count: c.count }))} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold">الأكثر طلباً</h2>
          <ul className="space-y-3">
            {data.topProviders.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3"><span className="w-4 text-sm font-bold text-ink-muted">{i + 1}</span><Avatar src={p.image} name={p.name} className="h-9 w-9" /><span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{p.name}</span><span className="text-sm font-bold text-primary-700">{formatNumber(p.count)}</span></li>
            ))}
            {!data.topProviders.length && <EmptyState title="لا توجد بيانات كافية بعد" className="py-6" />}
          </ul>
        </div>
      </div>

      <div className="card">
        <header className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-bold">أحدث المواعيد</h2></header>
        {data.recent.length === 0 ? <EmptyState title="لا توجد مواعيد بعد" className="py-10" /> : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0"><p className="truncate font-semibold text-ink">{a.customer?.name} <span className="font-normal text-ink-muted">→ {a.provider?.name}</span></p><p className="text-xs text-ink-muted">{a.serviceName}</p></div>
                <div className="flex shrink-0 items-center gap-3"><span className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(a.startAt)}</span><StatusBadge status={a.status} /></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
