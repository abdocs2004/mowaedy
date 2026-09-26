import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import { Logo } from '../layout/Logo.jsx';

const points = [
  { icon: CalendarCheck, text: 'احجز في ثوانٍ مع أفضل مقدمي الخدمة' },
  { icon: Clock, text: 'مواعيد متاحة فعلياً وتأكيد فوري' },
  { icon: ShieldCheck, text: 'بياناتك محمية وآمنة' },
];

/** Two-column layout for login/register: brand panel (desktop) + form card. */
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src="/images/reception.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-ink/95" />
        <div className="relative flex h-full flex-col justify-center p-14 text-white">
          <Logo light />
          <h2 className="mt-10 max-w-md text-4xl font-extrabold leading-snug text-white">احجز خدمتك في ثوانٍ</h2>
          <p className="mt-4 max-w-md leading-8 text-slate-300">منصتك الموحدة للعثور على أفضل مقدمي الخدمات وحجز مواعيدك بسهولة تامة.</p>
          <ul className="mt-10 space-y-4">{points.map((p) => <li key={p.text} className="flex items-center gap-3 text-sm text-slate-200"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><p.icon className="h-5 w-5" /></span>{p.text}</li>)}</ul>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mb-7 mt-2 text-ink-muted">{subtitle}</p>
          <div className="card p-6 sm:p-7">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-ink-muted">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
