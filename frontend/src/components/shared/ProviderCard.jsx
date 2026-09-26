import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { categoryIcon } from '../../lib/categories.js';
import { formatPrice } from '../../lib/format.js';
import { Badge, Stars } from '../ui/index.js';

export function ProviderCard({ provider: p }) {
  const Icon = categoryIcon(p.category?.slug);
  return (
    <Link to={`/providers/${p._id}`} className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-pop">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute end-3 top-3"><Badge tone="blue" className="bg-white/95 backdrop-blur"><Icon className="h-3.5 w-3.5" /> {p.category?.singularAr || p.category?.nameAr}</Badge></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-ink">{p.name}</h3>
        {p.businessName && <p className="text-sm font-medium text-primary-700">{p.businessName}</p>}
        <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{[p.address, p.city].filter(Boolean).join('، ')}</span></p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Stars value={p.rating?.avg || 0} count={p.rating?.count} />
          {p.startingPrice !== null && p.startingPrice !== undefined && (
            <span className="text-sm text-ink-muted">تبدأ من <b className="text-ink">{formatPrice(p.startingPrice)}</b></span>
          )}
        </div>
        <span className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">عرض الملف واحجز موعدك</span>
      </div>
    </Link>
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4"><div className="skeleton h-5 w-2/3" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-4 w-full" /><div className="skeleton mt-4 h-10 w-full" /></div>
    </div>
  );
}
