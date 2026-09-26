import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABEL } from '../../lib/format.js';
import { Avatar } from '../ui/index.js';
import { Logo } from './Logo.jsx';

/** Shared shell for the admin and provider dashboards: sidebar (drawer on mobile) + header. */
export function DashboardLayout({ nav, badge }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const item = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5"><Logo light to={user.role === 'admin' ? '/admin' : '/provider'} /><button className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق القائمة"><X className="h-5 w-5" /></button></div>
      <p className="px-6 pb-2 pt-3 text-xs font-semibold text-slate-500">{user.role === 'admin' ? 'لوحة الإدارة' : 'لوحة مقدم الخدمة'}</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="قائمة لوحة التحكم">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={item}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge?.[to] > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-ink">{badge[to]}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><ExternalLink className="h-5 w-5" /> العودة للموقع</NavLink>
        <button onClick={async () => { await logout(); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10"><LogOut className="h-5 w-5" /> تسجيل الخروج</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-muted">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 bg-ink lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85vw] animate-fade-in bg-ink shadow-pop">{sidebar}</aside>
        </div>
      )}
      <div className="lg:ms-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-ink hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="فتح القائمة"><Menu className="h-6 w-6" /></button>
          <div className="hidden text-sm text-ink-muted lg:block">مرحباً، <span className="font-bold text-ink">{user.name}</span></div>
          <div className="ms-auto flex items-center gap-3">
            <div className="text-end leading-tight"><p className="max-w-[10rem] truncate text-sm font-bold text-ink">{user.name}</p><p className="text-xs text-ink-muted">{ROLE_LABEL[user.role]}</p></div>
            <Avatar name={user.name} className="h-10 w-10" />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-extrabold text-ink">{title}</h1>{description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}</div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
