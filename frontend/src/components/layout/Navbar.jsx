import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, User, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar, LinkButton } from '../ui/index.js';
import { Logo } from './Logo.jsx';

const links = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/providers', label: 'مقدمو الخدمة' },
];
const anchors = [
  { to: '/#service', label: 'الخدمات' },
  { to: '/#reviews', label: 'آراء العملاء' },
  { to: '/#contact', label: 'تواصل معنا' },
];

function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50 hover:text-ink';
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pe-2 ps-3 text-sm font-semibold text-ink hover:bg-slate-50">
        <Avatar name={user.name} className="h-7 w-7" />
        <span className="hidden max-w-[8rem] truncate sm:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-60 animate-slide-up rounded-2xl border border-slate-200 bg-white p-1.5 shadow-pop">
          <div className="border-b border-slate-100 px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted" dir="ltr">{user.email}</p>
          </div>
          <div className="pt-1.5" onClick={() => setOpen(false)}>
            {user.role === 'user' && <Link role="menuitem" to="/my-appointments" className={item}><CalendarDays className="h-4 w-4" /> مواعيدي</Link>}
            {user.role !== 'user' && <Link role="menuitem" to={user.role === 'admin' ? '/admin' : '/provider'} className={item}><LayoutDashboard className="h-4 w-4" /> لوحة التحكم</Link>}
            <Link role="menuitem" to="/profile" className={item}><User className="h-4 w-4" /> حسابي</Link>
            <button role="menuitem" className={`${item} text-red-600 hover:bg-red-50 hover:text-red-700`}
              onClick={async () => { await logout(); toast.info('تم تسجيل الخروج'); navigate('/'); }}>
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
            {anchors.map((l) => <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink">{l.label}</Link>)}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!ready ? <div className="skeleton h-10 w-28" /> : user ? <UserMenu /> : (
            <div className="hidden items-center gap-2 sm:flex">
              <LinkButton to="/login" variant="ghost" size="sm"><LogIn className="h-4 w-4" /> تسجيل الدخول</LinkButton>
              <LinkButton to="/register" size="sm"><UserPlus className="h-4 w-4" /> إنشاء حساب</LinkButton>
            </div>
          )}
          <button className="rounded-lg p-2 text-ink hover:bg-slate-100 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="القائمة">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="animate-fade-in border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden" aria-label="القائمة المحمولة">
          <div className="flex flex-col gap-1">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${linkClass({ isActive })} py-3`}>{l.label}</NavLink>)}
            {anchors.map((l) => <Link key={l.to} to={l.to} className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-slate-100">{l.label}</Link>)}
          </div>
          {ready && !user && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <LinkButton to="/login" variant="secondary">تسجيل الدخول</LinkButton>
              <LinkButton to="/register">إنشاء حساب</LinkButton>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
