import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Ban, CalendarDays, CheckCircle2, ExternalLink, MapPin, Store } from 'lucide-react';
import { AppointmentsManager } from '../../components/shared/AppointmentsManager.jsx';
import { Avatar, Badge, Button, ErrorState, PageLoader, Stars, Tabs } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { formatDuration, formatPrice } from '../../lib/format.js';

const TABS = [{ value: 'overview', label: 'نظرة عامة' }, { value: 'appointments', label: 'المواعيد' }];

export default function AdminProviderDetailsPage() {
  const { id } = useParams();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const { data: p, loading, error, reload } = useFetch((signal) => api.get(`/admin/providers/${id}`, { signal }), [id]);

  const toggleActive = async () => {
    try { const res = await api.patch(`/admin/providers/${id}`, { isActive: !p.isActive }); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading && !p) return <PageLoader />;
  if (error && !p) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={p.image} name={p.name} className="h-16 w-16" rounded="rounded-2xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold text-ink">{p.name}</h1><Badge tone={p.isActive ? 'green' : 'red'} dot>{p.isActive ? 'نشط' : 'معطّل'}</Badge></div>
            <p className="text-sm text-ink-muted">{p.businessName} · {p.category?.nameAr}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted"><MapPin className="h-3.5 w-3.5" /> {[p.address, p.city].filter(Boolean).join('، ')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/providers/${p._id}`} target="_blank"><Button variant="secondary"><ExternalLink className="h-4 w-4" /> عرض الصفحة العامة</Button></Link>
          <Button variant={p.isActive ? 'danger-soft' : 'success'} onClick={toggleActive}>{p.isActive ? <><Ban className="h-4 w-4" /> تعطيل</> : <><CheckCircle2 className="h-4 w-4" /> تفعيل</>}</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs text-ink-muted">التقييم</p><div className="mt-1"><Stars value={p.rating?.avg || 0} count={p.rating?.count} showValue /></div></div>
        <div className="card p-4"><p className="text-xs text-ink-muted">إجمالي المواعيد</p><p className="mt-1 text-xl font-extrabold text-ink">{p.appointmentsCount}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-muted">صاحب الحساب</p><p className="mt-1 truncate font-semibold text-ink">{p.owner?.name}</p><p className="ltr-num truncate text-xs text-ink-muted">{p.owner?.email}</p></div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />
      {tab === 'overview' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5"><h2 className="mb-3 text-base font-bold">الوصف</h2><p className="text-sm leading-7 text-ink-soft">{p.description || '—'}</p></div>
          <div className="card p-5">
            <h2 className="mb-3 flex items-center justify-between text-base font-bold">الخدمات <Badge tone="blue">{p.services?.length || 0}</Badge></h2>
            {p.services?.length ? (
              <ul className="divide-y divide-slate-100">{p.services.map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className={s.isActive ? 'text-ink' : 'text-slate-400 line-through'}>{s.name} · {formatDuration(s.durationMinutes)}</span><span className="font-bold text-primary-700">{formatPrice(s.price)}</span></li>
              ))}</ul>
            ) : <p className="py-4 text-center text-sm text-ink-muted">لا توجد خدمات مضافة بعد.</p>}
          </div>
        </div>
      ) : <AppointmentsManager basePath="/admin/appointments" admin fixedProvider={p._id} onChanged={reload} />}
    </div>
  );
}
