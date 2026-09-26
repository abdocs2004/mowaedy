import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors select-none disabled:cursor-not-allowed disabled:opacity-55';
const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary: 'border border-slate-300 bg-white text-ink hover:bg-slate-50 active:bg-slate-100',
  soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  ghost: 'text-ink-soft hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  'danger-soft': 'bg-red-50 text-red-700 hover:bg-red-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  dark: 'bg-ink text-white hover:bg-primary-800',
  light: 'bg-white text-primary-700 hover:bg-primary-50 shadow-sm',
};
const sizes = { xs: 'h-8 px-2.5 text-xs', sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-12 px-7 text-base' };

export const buttonClass = ({ variant = 'primary', size = 'md', block = false, className = '' } = {}) =>
  `${base} ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`;

export function Button({ variant, size, block, loading = false, disabled, children, className, type = 'button', ...props }) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass({ variant, size, block, className })} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({ variant, size, block, className, children, ...props }) {
  return <Link className={buttonClass({ variant, size, block, className })} {...props}>{children}</Link>;
}

export function IconButton({ label, children, className = '', variant = 'ghost', ...props }) {
  return (
    <button type="button" aria-label={label} title={label} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-ink-muted hover:bg-slate-100 hover:text-ink'} ${className}`} {...props}>
      {children}
    </button>
  );
}
