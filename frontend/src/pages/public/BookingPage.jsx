import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarCheck, CalendarX, CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, SearchX, Timer } from 'lucide-react';
import { Button, EmptyState, ErrorState, Input, LinkButton, Skeleton, StatusBadge, Textarea } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { dateParts, formatDate, formatDuration, formatHHmm, formatPrice, formatTime } from '../../lib/format.js';
import { rules } from '../../lib/validators.js';

const DAYS_SHOWN = 28;
const PER_PAGE = 7;
const GROUPS = [
  { key: 'morning', label: 'صباحاً', test: (h) => h < 12 },
  { key: 'afternoon', label: 'ظهراً وعصراً', test: (h) => h >= 12 && h < 17 },
  { key: 'evening', label: 'مساءً', test: (h) => h >= 17 },
];

const Step = ({ n, title, done, children }) => (
  <section className="card p-5 sm:p-6">
    <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white'}`}>{done ? '✓' : n}</span>{title}
    </h2>
    {children}
  </section>
);

function Confirmation({ appointment: a, message }) {
  return (
    <div className="container-page py-10">
      <div className="card mx-auto max-w-xl animate-slide-up p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-9 w-9" /></span>
        <h1 className="text-2xl font-extrabold">تم إرسال حجزك بنجاح</h1>
        <p className="mt-2 text-ink-muted">{message}</p>
        <dl className="mt-6 divide-y divide-slate-100 rounded-2xl bg-surface-muted text-start text-sm">
          {[['مقدم الخدمة', a.provider?.name], ['الخدمة', a.serviceName], ['التاريخ', formatDate(a.startAt)], ['الوقت', formatTime(a.startAt)], ['السعر', formatPrice(a.price)]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-ink-muted">{k}</dt><dd className="font-bold text-ink">{v}</dd></div>
          ))}
          <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-ink-muted">الحالة</dt><dd><StatusBadge status={a.status} /></dd></div>
        </dl>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton to="/my-appointments" size="lg">عرض مواعيدي</LinkButton>
          <LinkButton to="/providers" size="lg" variant="secondary">حجز موعد آخر</LinkButton>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const provider = useFetch((signal) => api.get(`/providers/${id}`, { signal }), [id]);
  const services = provider.data?.services || [];

  const [serviceId, setServiceId] = useState(sp.get('service') || '');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(null);

  // Single-service providers: pre-select it.
  useEffect(() => { if (!serviceId && services.length === 1) setServiceId(services[0]._id); }, [services, serviceId]);
  const service = services.find((s) => s._id === serviceId);
  useEffect(() => { if (serviceId && provider.data && !service) setServiceId(''); }, [provider.data, service, serviceId]);

  const avail = useFetch((signal) => api.get(`/providers/${id}/availability`, { signal, params: { serviceId, days: DAYS_SHOWN } }), [id, serviceId], { enabled: Boolean(service) });
  const days = avail.data || [];

  // Auto-select the first day that has free slots.
  useEffect(() => {
    if (!days.length || date) return;
    const idx = days.findIndex((d) => d.availableSlots > 0);
    if (idx >= 0) { setDate(days[idx].date); setPage(Math.floor(idx / PER_PAGE)); }
  }, [days, date]);

  const slots = useFetch((signal) => api.get(`/providers/${id}/slots`, { signal, params: { serviceId, date } }), [id, serviceId, date], { enabled: Boolean(service && date) });

  const grouped = useMemo(() => {
    const list = slots.data?.slots || [];
    return GROUPS.map((g) => ({ ...g, items: list.filter((s) => g.test(Number(s.time.slice(0, 2)))) })).filter((g) => g.items.length);
  }, [slots.data]);

  const form = useForm({ customerName: user?.name || '', customerPhone: user?.phone || '', notes: '' }, { customerName: rules.name, customerPhone: rules.phone });

  const chooseService = (sid) => { setServiceId(sid); setDate(''); setSlot(null); setPage(0); };
  const chooseDate = (d) => { setDate(d); setSlot(null); };

  const submit = form.handleSubmit(async (v) => {
    if (!slot) { toast.warning('يرجى اختيار الموعد أولاً'); return; }
    try {
      const res = await api.post('/appointments', { providerId: id, serviceId, startAt: slot.start, customerName: v.customerName.trim(), customerPhone: v.customerPhone, notes: v.notes.trim() || undefined });
      setDone(res);
    } catch (err) {
      if (err.errors) throw err;
      toast.error(err.message);
      if (['SLOT_TAKEN', 'INVALID_SLOT', 'USER_OVERLAP'].includes(err.code)) { setSlot(null); slots.reload(); avail.reload(); }
      else if (err.status === 401) navigate('/login', { state: { from: `/providers/${id}/book` } });
    }
  });

  if (done) return <Confirmation appointment={done.data} message={done.message} />;
  if (provider.loading && !provider.data) return <div className="container-page grid gap-6 py-8 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Skeleton className="h-48" /><Skeleton className="h-64" /></div><Skeleton className="h-80" /></div>;
  if (provider.error?.status === 404) return <EmptyState icon={SearchX} className="py-24" title="مقدم الخدمة غير موجود" action={<LinkButton to="/providers">تصفح مقدمي الخدمة</LinkButton>} />;
  if (provider.error && !provider.data) return <ErrorState error={provider.error} onRetry={provider.reload} className="py-24" />;

  const p = provider.data;
  const visibleDays = days.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const pages = Math.ceil(days.length / PER_PAGE);

  return (
    <div className="container-page py-8">
      <nav className="mb-5 text-sm text-ink-muted" aria-label="مسار التنقل"><Link to={`/providers/${p._id}`} className="hover:text-primary-700">← {p.name}</Link></nav>
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">احجز موعدك</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Step n={1} title="اختر الخدمة" done={Boolean(service)}>
            {services.length === 0 ? <EmptyState icon={CalendarX} title="لا توجد خدمات متاحة للحجز حالياً" className="py-6" /> : (
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="الخدمات">
                {services.map((s) => {
                  const active = s._id === serviceId;
                  return (
                    <button key={s._id} role="radio" aria-checked={active} onClick={() => chooseService(s._id)}
                      className={`rounded-2xl border-2 p-4 text-start transition-all ${active ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/10' : 'border-slate-200 bg-white hover:border-primary-300'}`}>
                      <span className="flex items-start justify-between gap-2"><span className="font-bold text-ink">{s.name}</span><span className="font-extrabold text-primary-700">{formatPrice(s.price)}</span></span>
                      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted"><Timer className="h-3.5 w-3.5" /> {formatDuration(s.durationMinutes)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Step>

          {service && (
            <Step n={2} title="اختر اليوم" done={Boolean(date)}>
              {avail.loading && !avail.data ? <div className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>
                : avail.error ? <ErrorState error={avail.error} onRetry={avail.reload} className="py-6" />
                : days.every((d) => d.availableSlots === 0) ? <EmptyState icon={CalendarX} className="py-6" title="لا توجد مواعيد متاحة خلال الفترة القادمة" description="جرّب خدمة أخرى أو تواصل مع مقدم الخدمة مباشرة." />
                : (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-ink-muted">{date ? dateParts(date).long : 'اختر يوماً'}</span>
                      <div className="flex gap-1">
                        <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((x) => x - 1)} aria-label="الأسبوع السابق"><ChevronRight className="h-5 w-5" /></button>
                        <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40" disabled={page >= pages - 1} onClick={() => setPage((x) => x + 1)} aria-label="الأسبوع التالي"><ChevronLeft className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="listbox" aria-label="الأيام">
                      {visibleDays.map((d) => {
                        const parts = dateParts(d.date);
                        const disabled = d.availableSlots === 0;
                        const active = d.date === date;
                        return (
                          <button key={d.date} role="option" aria-selected={active} disabled={disabled} onClick={() => chooseDate(d.date)}
                            className={`flex flex-col items-center rounded-xl border-2 px-1 py-2.5 transition-colors ${active ? 'border-primary-600 bg-primary-600 text-white' : disabled ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 bg-white hover:border-primary-300'}`}>
                            <span className="text-[11px] font-semibold sm:text-xs">{parts.weekday}</span>
                            <span className="text-lg font-extrabold leading-tight sm:text-xl">{parts.day}</span>
                            <span className="text-[11px] sm:text-xs">{parts.month}</span>
                            <span className={`mt-1 text-[10px] font-semibold ${active ? 'text-white/90' : disabled ? 'text-slate-400' : 'text-emerald-600'}`}>{!d.isOpen ? 'مغلق' : disabled ? 'مكتمل' : `${d.availableSlots} متاح`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </Step>
          )}

          {service && date && (
            <Step n={3} title="اختر الوقت" done={Boolean(slot)}>
              {slots.loading && !slots.data ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>
                : slots.error ? <ErrorState error={slots.error} onRetry={slots.reload} className="py-6" />
                : grouped.length === 0 ? <EmptyState icon={Clock} className="py-6" title="لا توجد أوقات متاحة في هذا اليوم" description="اختر يوماً آخر." />
                : (
                  <div className="space-y-5">
                    {grouped.map((g) => (
                      <div key={g.key}><h3 className="mb-2 text-sm font-bold text-ink-muted">{g.label}</h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label={g.label}>
                          {g.items.map((s) => {
                            const active = slot?.start === s.start;
                            return <button key={s.start} role="option" aria-selected={active} onClick={() => setSlot(s)}
                              className={`h-11 rounded-xl border-2 text-sm font-bold transition-colors ${active ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-ink hover:border-primary-400 hover:bg-primary-50'}`}>{formatHHmm(s.time)}</button>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </Step>
          )}

          {service && slot && (
            <Step n={4} title="بياناتك">
              <form id="booking-form" onSubmit={submit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="الاسم" required autoComplete="name" {...form.bind('customerName')} />
                  <Input label="رقم الهاتف" required type="tel" autoComplete="tel" placeholder="01xxxxxxxxx" {...form.bind('customerPhone')} />
                </div>
                <Textarea label="ملاحظات (اختياري)" rows={3} maxLength={500} placeholder="أي تفاصيل تود إخبار مقدم الخدمة بها" {...form.bind('notes')} />
              </form>
            </Step>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0"><p className="truncate font-bold text-ink">{p.name}</p><p className="flex items-center gap-1 truncate text-xs text-ink-muted"><MapPin className="h-3 w-3 shrink-0" />{[p.address, p.city].filter(Boolean).join('، ')}</p></div>
            </div>
            <h2 className="mb-3 mt-4 text-base font-bold">ملخص الحجز</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">الخدمة</dt><dd className="font-semibold text-ink">{service?.name || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">المدة</dt><dd className="font-semibold text-ink">{service ? formatDuration(service.durationMinutes) : '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">اليوم</dt><dd className="font-semibold text-ink">{date ? dateParts(date).long : '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">الوقت</dt><dd className="font-semibold text-ink">{slot ? formatHHmm(slot.time) : '—'}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base"><dt className="font-bold text-ink">الإجمالي</dt><dd className="font-extrabold text-primary-700">{service ? formatPrice(service.price) : '—'}</dd></div>
            </dl>
            <Button type="submit" form="booking-form" size="lg" block className="mt-5" disabled={!slot} loading={form.submitting}><CalendarCheck className="h-5 w-5" /> تأكيد الحجز</Button>
            <p className="mt-3 text-center text-xs text-ink-muted">{p.autoConfirm ? 'سيتم تأكيد حجزك فوراً.' : 'سيصلك التأكيد بعد موافقة مقدم الخدمة.'} يمكنك الإلغاء قبل الموعد بساعتين على الأقل.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
