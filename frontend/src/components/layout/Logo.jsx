import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

export function Logo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 font-extrabold ${className}`} aria-label="مواعيدي — الصفحة الرئيسية">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${light ? 'bg-white/15 text-white' : 'bg-primary-600 text-white'}`}><CalendarCheck className="h-5 w-5" /></span>
      <span className={`text-xl ${light ? 'text-white' : 'text-ink'}`}>مواعيدي</span>
    </Link>
  );
}
