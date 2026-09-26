import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CalendarX, Clock, MapPin, Phone, RotateCcw, Wallet, XCircle } from 'lucide-react';
import { Button, ConfirmDialog, EmptyState, ErrorState, LinkButton, Pagination, Skeleton, StatusBadge, Tabs, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { formatDate, formatDuration, formatPrice, formatTime } from '../../lib/format.js';

const TABS = [{ value: 'upcoming', label: 'القادمة' }, { value: 'past', label: 'السابقة' }, { value: 'all', label: 'الكل' }];

function AppointmentCard({ a, onCancel }) {
  const p = a.provider;
  const active = a.status === 'pending' || a.status === 'confirmed';
  const future = new Date(a.startAt) > new Date();
  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <Link to={`/providers/${p?._id}`} className="shrink-0"><img src={p?.image} alt="" className="h-24 w-full rounded-xl object-cover sm:w-32" /></Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><h3 className="truncate text-lg font-bold text-ink">{a.serviceName}</h3>
              <Link to={`/providers/${p?._id}`} className="text-sm font-semibold text-primary-700 hover:underline">{p?.name}</Link></div>
            <StatusBadge status={a.status} />
          </div>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-ink-soft sm:grid-cols-2">
            <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-ink-muted" />{formatDate(a.startAt)}</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-ink-muted" />{formatTime(a.startAt)} · {formatDuration(a.durationMinutes)}</li>
            <li className="flex items-center gap-2"><Wallet className="h-4 w-4 text-ink-muted" />{formatPrice(a.price)}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-muted" />{[p?.address, p?.city].filter(Boolean).join('، ')}</li>
          </ul>
          {a.status === 'cancelled' && a.cancelReason && <p className="mt-2 text-xs text-red-700">سبب الإلغاء: {a.cancelReason}</p>}
        </div>
      </div>
      {(active && future) || a.status !== 'pending' ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
          {p?.phone && active && <a href={`tel:${p.phone}`} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-slate-100"><Phone className="h-4 w-4" /> اتصال بمقدم الخدمة</a>}
          {active && future && <Button variant="danger-soft" size="sm" onClick={() => onCancel(a)}><XCircle className="h-4 w-4" /> إلغاء الموعد</Button>}
          {(a.status === 'completed' || a.status === 'cancelled') && <LinkButton to={`/providers/${p?._id}/book`} variant="soft" size="sm"><RotateCcw className="h-4 w-4" /> احجز مرة أخرى</LinkButton>}
        </div>
      ) : null}
    </article>
  );
}

export default function MyAppointmentsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, meta, loading, error, reload } = useFetch(
    (signal) => api.get('/appointments/mine', { signal, params: { scope: tab === 'all' ? undefined : tab, page, limit: 6 } }),
    [tab, page]
  );

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await api.patch(`/appointments/${target._id}/cancel`, { reason: reason.trim() || undefined });
      toast.success(res.message);
      setTarget(null); setReason('');
      reload();
    } catch (err) {
      toast.error(err.message);
      setTarget(null);
    } finally { setBusy(false); }
  };

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold">مواعيدي</h1>
        <Tabs tabs={TABS} value={tab} onChange={(v) => { setTab(v); setPage(1); }} />
      </div>

      {error && !data ? <ErrorState error={error} onRetry={reload} /> : (
        <div className={`space-y-4 ${loading && data ? 'opacity-60' : ''}`}>
          {loading && !data && [0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
          {(data || []).map((a) => <AppointmentCard key={a._id} a={a} onCancel={setTarget} />)}
          {!loading && data?.length === 0 && (
            <div className="card"><EmptyState icon={CalendarX} title={tab === 'upcoming' ? 'لا توجد مواعيد قادمة' : 'لا توجد مواعيد'} description="ابدأ بحجز موعدك الأول مع أفضل مقدمي الخدمة."
              action={<LinkButton to="/providers">تصفح مقدمي الخدمة</LinkButton>} /></div>
          )}
          <Pagination meta={meta} onChange={setPage} className="pt-2" />
        </div>
      )}

      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={cancel} loading={busy} danger title="إلغاء الموعد" confirmLabel="نعم، إلغاء الموعد" cancelLabel="تراجع"
        message={target && <>هل تريد إلغاء موعد <b>{target.serviceName}</b> لدى <b>{target.provider?.name}</b> يوم {formatDate(target.startAt)} الساعة {formatTime(target.startAt)}؟</>}>
        <Textarea label="سبب الإلغاء (اختياري)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} wrapperClass="mt-4" maxLength={300} />
      </ConfirmDialog>
    </div>
  );
}
