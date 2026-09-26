import { Link } from 'react-router-dom';
import { site } from '../../lib/siteConfig.js';
import { Logo } from './Logo.jsx';

const Svg = ({ children }) => <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>{children}</svg>;
const social = [
  { key: 'threads', label: 'Threads', icon: <Svg><path d="M12.2 22c-3.9 0-6.9-2.4-7.1-6.9l2.4-.1c.1 3 2 4.6 4.7 4.6 2.5 0 4-1.3 4-3.2 0-1.7-1.1-2.6-3.6-3.1-1-.2-2.2-.4-3.1-.9-1.3-.7-2-1.8-2-3.4 0-2.7 2.1-4.4 5-4.4 2.8 0 4.7 1.5 5.1 4.1l-2.4.4c-.2-1.4-1.2-2.2-2.7-2.2-1.5 0-2.6.8-2.6 2 0 .9.5 1.5 1.6 1.9.7.2 1.6.4 2.5.6 2.9.7 4.5 2 4.5 4.6 0 3-2.5 5-6.3 5z" /></Svg> },
  { key: 'instagram', label: 'Instagram', icon: <Svg><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.3 6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.4 0-2.7 0-3.7.1-3.2.1-4.7 1.7-4.9 4.9C3 9.1 3 9.4 3 12s0 2.9.1 3.9c.1 3.2 1.7 4.7 4.9 4.9 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.2-.1 4.7-1.7 4.9-4.9.1-1 .1-1.3.1-3.9s0-2.9-.1-3.9c-.1-3.2-1.7-4.7-4.9-4.9C14.7 3 14.4 3 12 3zm0 1.6c2.4 0 2.7 0 3.6.1 2.2.1 3.2 1.1 3.3 3.3.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.2-1.1 3.2-3.3 3.3-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.2-.1-3.2-1.1-3.3-3.3-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.2 1.1-3.2 3.3-3.3.9-.1 1.2-.1 3.6-.1z" /></Svg> },
  { key: 'facebook', label: 'Facebook', icon: <Svg><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.2V13H10v8h3.5z" /></Svg> },
];

const col = 'mb-3 text-sm font-bold text-white';
const linkCls = 'text-sm text-slate-400 transition-colors hover:text-white';

export function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">أسهل طريقة لحجز مواعيدك مع أفضل مقدمي الخدمات. راحتك تبدأ من هنا.</p>
          <div className="mt-5 flex gap-2">
            {social.map((s) => (
              <a key={s.key} href={site.social[s.key]} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-primary-600">{s.icon}</a>
            ))}
          </div>
        </div>
        <div>
          <h3 className={col}>روابط سريعة</h3>
          <ul className="space-y-2.5">
            <li><Link className={linkCls} to="/#service">الخدمات</Link></li>
            <li><Link className={linkCls} to="/providers">مقدمو الخدمة</Link></li>
            <li><Link className={linkCls} to="/#contact">الدعم</Link></li>
          </ul>
        </div>
        <div>
          <h3 className={col}>قانوني</h3>
          <ul className="space-y-2.5">
            <li><span className={linkCls}>الأسئلة الشائعة</span></li>
            <li><span className={linkCls}>سياسة الخصوصية</span></li>
            <li><span className={linkCls}>شروط الخدمة</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">© {site.year} مواعيدي. جميع الحقوق محفوظة.</div>
    </footer>
  );
}
