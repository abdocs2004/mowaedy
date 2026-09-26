import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterX, MapPin, SearchX } from 'lucide-react';
import { ProviderCard, ProviderCardSkeleton } from '../../components/shared/ProviderCard.jsx';
import { Button, EmptyState, ErrorState, Pagination, SearchInput, Select } from '../../components/ui/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { categoryIcon } from '../../lib/categories.js';
import { formatNumber } from '../../lib/format.js';

const SORTS = [{ value: 'rating', label: 'الأعلى تقييماً' }, { value: 'name', label: 'الاسم (أ - ي)' }, { value: 'newest', label: 'الأحدث' }];

export default function ProvidersPage() {
  const [params, setParams] = useSearchParams();
  // `type` is the legacy query key from the original static site.
  const category = params.get('category') || params.get('type') || '';
  const location = params.get('location') || '';
  const sort = params.get('sort') || 'rating';
  const page = Number(params.get('page')) || 1;

  const [q, setQ] = useState(params.get('q') || '');
  const [service, setService] = useState(params.get('service') || '');
  const dq = useDebounce(q);
  const ds = useDebounce(service);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    next.delete('type');
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  useEffect(() => { if ((params.get('q') || '') !== dq) update({ q: dq }); /* eslint-disable-next-line */ }, [dq]);
  useEffect(() => { if ((params.get('service') || '') !== ds) update({ service: ds }); /* eslint-disable-next-line */ }, [ds]);

  const cats = useFetch((signal) => api.get('/categories', { signal }));
  const locations = useFetch((signal) => api.get('/providers/locations', { signal }));
  const list = useFetch(
    (signal) => api.get('/providers', { signal, params: { q: params.get('q'), category, location, service: params.get('service'), sort, page, limit: 9 } }),
    [params.toString()]
  );

  const hasFilters = Boolean(q || service || category || location);
  const reset = () => { setQ(''); setService(''); setParams({}, { replace: true }); };
  const current = (cats.data || []).find((c) => c.slug === category);

  return (
    <div>
      <section className="border-b border-slate-200/70 bg-white">
        <div className="container-page py-10">
          <h1 className="text-3xl font-extrabold">{current ? current.nameAr : 'مقدمو الخدمة'}</h1>
          <p className="mt-2 text-ink-muted">اختر مقدم الخدمة المناسب لك واحجز موعدك في ثوانٍ.</p>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب القسم">
            {[{ slug: '', nameAr: 'الكل' }, ...(cats.data || [])].map((c) => {
              const Icon = c.slug ? categoryIcon(c.slug) : null;
              const active = category === c.slug;
              return (
                <button key={c.slug || 'all'} onClick={() => update({ category: c.slug })} aria-pressed={active}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${active ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'}`}>
                  {Icon && <Icon className="h-4 w-4" />} {c.nameAr}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput value={q} onChange={setQ} placeholder="ابحث بالاسم…" label="بحث بالاسم" />
            <SearchInput value={service} onChange={setService} placeholder="ابحث بالخدمة (مثال: قص شعر)" label="بحث بالخدمة" />
            <Select aria-label="الموقع" value={location} onChange={(e) => update({ location: e.target.value })} placeholder="كل المناطق" options={(locations.data || []).map((c) => ({ value: c, label: c }))} />
            <Select aria-label="الترتيب" value={sort} onChange={(e) => update({ sort: e.target.value })} options={SORTS} />
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex min-h-9 items-center justify-between gap-3">
          <p className="text-sm text-ink-muted" aria-live="polite">{list.meta && !list.error ? <><b className="text-ink">{formatNumber(list.meta.total)}</b> نتيجة</> : ' '}{location && <span className="ms-2 inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>}</p>
          {hasFilters && <Button variant="ghost" size="sm" onClick={reset}><FilterX className="h-4 w-4" /> مسح الفلاتر</Button>}
        </div>

        {list.error && !list.data ? <ErrorState error={list.error} onRetry={list.reload} /> : (
          <>
            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${list.loading && list.data ? 'opacity-60 transition-opacity' : ''}`}>
              {list.loading && !list.data && Array.from({ length: 6 }, (_, i) => <ProviderCardSkeleton key={i} />)}
              {(list.data || []).map((p) => <ProviderCard key={p._id} provider={p} />)}
            </div>
            {!list.loading && list.data?.length === 0 && (
              <EmptyState icon={SearchX} title="لا توجد نتائج مطابقة" description="جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر."
                action={hasFilters && <Button variant="secondary" onClick={reset}>مسح كل الفلاتر</Button>} />
            )}
            <Pagination meta={list.meta} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-8" />
          </>
        )}
      </section>
    </div>
  );
}
