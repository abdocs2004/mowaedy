import { useEffect, useState } from 'react';
import { CalendarSearch, Check, CheckCheck, Eye, FilterX, Phone, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { STATUS, STATUS_OPTIONS, TRANSITIONS, formatDate, formatDateTime, formatDuration, formatPrice, formatTime } from '../../lib/format.js';
import { Avatar, Button, ConfirmDialog, DataTable, EmptyState, ErrorState, IconButton, Input, Modal, Pagination, SearchInput, Select, Skeleton, StatusBadge, Textarea } from '../ui/index.js';

const ACTIONS = {
  confirmed: { label: 'تأكيد', icon: Check, variant: 'success' },
  completed: { label: 'إكمال', icon: CheckCheck, variant: 'soft' },
  cancelled: { label: 'إلغاء', icon: X, variant: 'danger-soft' },
};

function StatusButtons({ a, onAction, size = 'xs' }) {
  const next = TRANSITIONS[a.status] || [];
  if (!next.length) return <span className="text-xs text-ink-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {next.map((s) => { const A = ACTIONS[s]; return <Button key={s} size={size} variant={A.variant} onClick={() => onAction(a, s)}><A.icon className="h-3.5 w-3.5" />{A.label}</Button>; })}
    </div>
  );
}

function DetailsModal({ a, onClose, onAction, admin }) {
  if (!a) return null;
  const rows = [
    ['العميل', a.customer?.name], ['الهاتف', <a key="t" href={`tel:${a.customer?.phone}`} className="ltr-num font-semibold text-primary-700" >{a.customer?.phone}</a>],
    ['البريد', <span key="e" className="ltr-num">{a.user?.email || a.customer?.email || '—'}</span>],
    ['مقدم الخدمة', a.provider?.name], ['الخدمة', a.serviceName], ['المدة', formatDuration(a.durationMinutes)],
    ['التاريخ', formatDate(a.startAt)], ['الوقت', `${formatTime(a.startAt)} – ${formatTime(a.endAt)}`], ['السعر', formatPrice(a.price)], ['تاريخ الطلب', formatDateTime(a.createdAt)],
  ];
  return (
    <Modal open onClose={onClose} title="تفاصيل الموعد" description={<StatusBadge status={a.status} />}
      footer={<><Button variant="secondary" onClick={onClose}>إغلاق</Button>{(TRANSITIONS[a.status] || []).map((s) => <Button key={s} variant={ACTIONS[s].variant} onClick={() => onAction(a, s)}>{ACTIONS[s].label}</Button>)}</>}>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-2 sm:block sm:border-0 sm:pb-0"><dt className="text-xs text-ink-muted">{k}</dt><dd className="font-semibold text-ink">{v || '—'}</dd></div>)}
      </dl>
      {a.notes && <div className="mt-4 rounded-xl bg-surface-muted p-3 text-sm"><p className="mb-1 text-xs font-semibold text-ink-muted">ملاحظات العميل</p>{a.notes}</div>}
      {a.status === 'cancelled' && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-900"><b>أُلغي بواسطة {({ user: 'العميل', provider: 'مقدم الخدمة', admin: 'الإدارة' })[a.cancelledBy] || '—'}</b>{a.cancelReason && <> — {a.cancelReason}</>}</div>}
    </Modal>
  );
}

/**
 * Shared appointments screen for providers and admins.
 * basePath: '/provider/appointments' | '/admin/appointments'
 */
export function AppointmentsManager({ basePath, admin = false, initialStatus = '', fixedProvider = '', onChanged }) {
  const toast = useToast();
  const [f, setF] = useState({ q: '', status: initialStatus, from: '', to: '', provider: fixedProvider });
  const [page, setPage] = useState(1);
  const dq = useDebounce(f.q);
  const [view, setView] = useState(null);
  const [pending, setPending] = useState(null); // { a, status }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const showProviderFilter = admin && !fixedProvider;

  const providers = useFetch((signal) => api.get('/admin/providers', { signal, params: { limit: 100 } }), [], { enabled: showProviderFilter });
  const list = useFetch((signal) => api.get(basePath, { signal, params: { q: dq, status: f.status, from: f.from, to: f.to, provider: f.provider, page, limit: 10 } }), [basePath, dq, f.status, f.from, f.to, f.provider, page]);
  useEffect(() => setPage(1), [dq, f.status, f.from, f.to, f.provider]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const hasFilters = f.q || f.status || f.from || f.to || f.provider;

  const ask = (a, status) => { setPending({ a, status }); setReason(''); };
  const run = async () => {
    setBusy(true);
    try {
      const res = await api.patch(`${basePath}/${pending.a._id}/status`, { status: pending.status, reason: reason.trim() || undefined });
      toast.success(res.message);
      setPending(null); setView(null);
      list.reload(); onChanged?.();
    } catch (err) { toast.error(err.message); setPending(null); list.reload(); }
    finally { setBusy(false); }
  };

  const columns = [
    { key: 'customer', header: 'العميل', render: (a) => <div><p className="font-bold text-ink">{a.customer?.name}</p><p className="ltr-num text-xs text-ink-muted">{a.customer?.phone}</p></div> },
    ...(admin ? [{ key: 'provider', header: 'مقدم الخدمة', hideBelow: 'lg', render: (a) => <div className="flex items-center gap-2"><Avatar src={a.provider?.image} name={a.provider?.name} className="h-8 w-8" /><span className="text-ink">{a.provider?.name}</span></div> }] : []),
    { key: 'service', header: 'الخدمة', render: (a) => <div><p className="text-ink">{a.serviceName}</p><p className="text-xs text-ink-muted">{formatPrice(a.price)}</p></div> },
    { key: 'when', header: 'الموعد', render: (a) => <div><p className="whitespace-nowrap font-semibold text-ink">{formatDateTime(a.startAt)}</p></div> },
    { key: 'status', header: 'الحالة', render: (a) => <StatusBadge status={a.status} /> },
    { key: 'actions', header: 'إجراءات', render: (a) => <div className="flex items-center gap-2"><IconButton label="عرض التفاصيل" onClick={() => setView(a)}><Eye className="h-5 w-5" /></IconButton><StatusButtons a={a} onAction={ask} /></div> },
  ];

  return (
    <>
      <div className="card mb-5 p-4">
        <div className={`grid gap-3 sm:grid-cols-2 ${showProviderFilter ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <SearchInput value={f.q} onChange={(v) => setF((s) => ({ ...s, q: v }))} placeholder="اسم العميل أو الهاتف أو الخدمة" label="بحث" className="sm:col-span-2 lg:col-span-1" />
          <Select aria-label="الحالة" value={f.status} onChange={set('status')} placeholder="كل الحالات" options={STATUS_OPTIONS} />
          {showProviderFilter && <Select aria-label="مقدم الخدمة" value={f.provider} onChange={set('provider')} placeholder="كل مقدمي الخدمة" options={(providers.data || []).map((p) => ({ value: p._id, label: p.name }))} />}
          <Input aria-label="من تاريخ" type="date" value={f.from} onChange={set('from')} title="من تاريخ" />
          <Input aria-label="إلى تاريخ" type="date" value={f.to} onChange={set('to')} title="إلى تاريخ" />
        </div>
        {hasFilters && <div className="mt-3 flex justify-end"><Button variant="ghost" size="sm" onClick={() => setF({ q: '', status: '', from: '', to: '', provider: '' })}><FilterX className="h-4 w-4" /> مسح الفلاتر</Button></div>}
      </div>

      <div className="card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload}
            empty={<EmptyState icon={CalendarSearch} title="لا توجد مواعيد" description={hasFilters ? 'لا توجد نتائج تطابق الفلاتر الحالية.' : 'ستظهر المواعيد هنا عند وصولها.'} />} />
        </div>
        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {list.error && !list.data ? <ErrorState error={list.error} onRetry={list.reload} /> : null}
          {list.loading && !list.data && [0, 1, 2].map((i) => <div key={i} className="p-4"><Skeleton className="h-24" /></div>)}
          {(list.data || []).map((a) => (
            <article key={a._id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-ink">{a.customer?.name}</p><p className="text-xs text-ink-muted">{a.serviceName} · {formatPrice(a.price)}</p></div><StatusBadge status={a.status} /></div>
              <p className="text-sm font-semibold text-ink">{formatDateTime(a.startAt)}{admin && <span className="ms-2 font-normal text-ink-muted">· {a.provider?.name}</span>}</p>
              <div className="flex flex-wrap items-center gap-2"><Button size="xs" variant="secondary" onClick={() => setView(a)}><Eye className="h-3.5 w-3.5" /> التفاصيل</Button><a href={`tel:${a.customer?.phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-ink-soft hover:bg-slate-100"><Phone className="h-3.5 w-3.5" /> اتصال</a><StatusButtons a={a} onAction={ask} /></div>
            </article>
          ))}
          {!list.loading && list.data?.length === 0 && <EmptyState icon={CalendarSearch} title="لا توجد مواعيد" />}
        </div>
        <div className="border-t border-slate-100 px-4 py-3"><Pagination meta={list.meta} onChange={setPage} /></div>
      </div>

      <DetailsModal a={view} onClose={() => setView(null)} onAction={ask} admin={admin} />
      <ConfirmDialog open={Boolean(pending)} onClose={() => setPending(null)} onConfirm={run} loading={busy} danger={pending?.status === 'cancelled'}
        title={pending ? `${ACTIONS[pending.status].label} الموعد` : ''} confirmLabel={pending ? ACTIONS[pending.status].label : ''}
        message={pending && <>سيتم تغيير حالة موعد <b>{pending.a.customer?.name}</b> ({formatDateTime(pending.a.startAt)}) إلى <b>{STATUS[pending.status].label}</b>.</>}>
        {pending?.status === 'cancelled' && <Textarea label="سبب الإلغاء (اختياري)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} wrapperClass="mt-4" maxLength={300} />}
      </ConfirmDialog>
    </>
  );
}
