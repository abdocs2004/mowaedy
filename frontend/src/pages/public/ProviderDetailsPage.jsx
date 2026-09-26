import { Link, useParams } from 'react-router-dom';
import { Building2, CalendarPlus, Clock, MapPin, Phone, SearchX, Sparkles, Timer, Wallet } from 'lucide-react';
import { WhatsAppIcon } from '../../components/shared/icons.jsx';
import { Badge, Button, EmptyState, ErrorState, LinkButton, Skeleton, Stars } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { categoryIcon, providerRoleLabel } from '../../lib/categories.js';
import { DAYS_AR, WEEK_ORDER, formatDuration, formatHHmm, formatPrice, whatsappLink } from '../../lib/format.js';

function Detail({ provider: p }) {
  const { user } = useAuth();
  const Icon = categoryIcon(p.category?.slug);
  const services = p.services || [];
  const cd = p.categoryData || {};
  const chips = [...(cd.specialty ? [cd.specialty] : []), ...(cd.specialties || []), ...(cd.facilities || [])];
  const startFrom = services.length ? Math.min(...services.map((s) => s.price)) : null;
  const canBook = !user || user.role === 'user';
  const hours = WEEK_ORDER.map((d) => p.workingHours?.find((w) => w.day === d) || { day: d, isOpen: false });

  return (
    <div className="container-page py-8">
      <nav className="mb-5 text-sm text-ink-muted" aria-label="مسار التنقل">
        <Link to="/providers" className="hover:text-primary-700">مقدمو الخدمة</Link><span className="mx-2">/</span>
        <Link to={`/providers?category=${p.category?.slug}`} className="hover:text-primary-700">{p.category?.nameAr}</Link><span className="mx-2">/</span>
        <span className="font-semibold text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card overflow-hidden">
            <div className="relative h-64 bg-slate-200 sm:h-80"><img src={p.image} alt={p.name} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <Badge tone="blue" className="mb-3 bg-white/95"><Icon className="h-3.5 w-3.5" /> {p.category?.singularAr || p.category?.nameAr}</Badge>
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{p.name}</h1>
                {p.businessName && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200"><Building2 className="h-4 w-4" /> {p.businessName}</p>}
              </div>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <Stars value={p.rating?.avg || 0} count={p.rating?.count} showValue />
                <span className="flex items-center gap-1.5 text-ink-soft"><MapPin className="h-4 w-4 text-primary-600" /> {[p.address, p.city].filter(Boolean).join('، ')}</span>
                {cd.experienceYears > 0 && <span className="flex items-center gap-1.5 text-ink-soft"><Sparkles className="h-4 w-4 text-primary-600" /> خبرة {cd.experienceYears} سنة</span>}
              </div>
              {p.description && <p className="leading-8 text-ink-soft">{p.description}</p>}
              {chips.length > 0 && <div className="flex flex-wrap gap-2">{chips.map((c) => <Badge key={c} tone="purple">{c}</Badge>)}</div>}
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="services-h">
            <h2 id="services-h" className="mb-4 text-xl font-bold">الخدمات والأسعار</h2>
            {services.length === 0 ? <p className="py-6 text-center text-sm text-ink-muted">لا توجد خدمات متاحة حالياً.</p> : (
              <ul className="divide-y divide-slate-100">
                {services.map((s) => (
                  <li key={s._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><h3 className="font-bold text-ink">{s.name}</h3>
                      {s.description && <p className="mt-0.5 text-sm text-ink-muted">{s.description}</p>}
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted"><Timer className="h-3.5 w-3.5" /> {formatDuration(s.durationMinutes)}</p></div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-lg font-extrabold text-primary-700">{formatPrice(s.price)}</span>
                      {canBook && <LinkButton to={`/providers/${p._id}/book?service=${s._id}`} size="sm" variant="soft">احجز</LinkButton>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            {startFrom !== null && <p className="mb-1 flex items-center gap-2 text-sm text-ink-muted"><Wallet className="h-4 w-4" /> تبدأ الأسعار من <b className="text-lg text-ink">{formatPrice(startFrom)}</b></p>}
            {canBook ? (
              <LinkButton to={`/providers/${p._id}/book`} size="lg" block className="mt-3" aria-disabled={!services.length}><CalendarPlus className="h-5 w-5" /> احجز موعدك الآن</LinkButton>
            ) : <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">حسابات مقدمي الخدمة والإدارة لا يمكنها حجز المواعيد. سجّل بحساب عميل للحجز.</p>}
            <p className="mt-3 text-center text-xs text-ink-muted">{p.autoConfirm ? 'يتم تأكيد الحجز فوراً' : 'يتم تأكيد الحجز بعد موافقة مقدم الخدمة'}</p>
            {(p.phone || p.whatsapp) && (
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                {p.phone && <a href={`tel:${p.phone}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-ink hover:bg-slate-50"><Phone className="h-4 w-4" /> اتصال</a>}
                {p.whatsapp && <a href={whatsappLink(p.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"><WhatsAppIcon className="h-4 w-4" /> واتساب</a>}
              </div>
            )}
          </section>

          <section className="card p-5" aria-labelledby="hours-h">
            <h2 id="hours-h" className="mb-3 flex items-center gap-2 text-lg font-bold"><Clock className="h-5 w-5 text-primary-600" /> ساعات العمل</h2>
            <ul className="space-y-2 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{DAYS_AR[h.day]}</span>
                  {h.isOpen ? <span className="text-ink-soft"><span className="ltr-num">{formatHHmm(h.start)} - {formatHHmm(h.end)}</span></span> : <Badge tone="gray">مغلق</Badge>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch((signal) => api.get(`/providers/${id}`, { signal }), [id]);

  if (loading && !data) return (<div className="container-page grid gap-6 py-8 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Skeleton className="h-96" /><Skeleton className="h-64" /></div><Skeleton className="h-72" /></div>);
  if (error?.status === 404 || error?.code === 'INVALID_ID' || error?.code === 'VALIDATION_ERROR') return <EmptyState icon={SearchX} className="py-24" title="مقدم الخدمة غير موجود" description="ربما تم حذف هذه الصفحة أو أن الرابط غير صحيح." action={<LinkButton to="/providers">تصفح مقدمي الخدمة</LinkButton>} />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} className="py-24" />;
  return <Detail provider={data} />;
}
