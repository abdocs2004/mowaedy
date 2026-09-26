import { forwardRef, useId } from 'react';
import { Search, X } from 'lucide-react';

export function Field({ label, error, hint, required, id, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ms-1 text-red-500" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const control = (error) =>
  `block w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:bg-slate-100 disabled:text-slate-500 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 hover:border-slate-400'}`;

const aria = (id, error, hint) => ({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined });

export const Input = forwardRef(function Input({ label, error, hint, required, icon: Icon, className = '', wrapperClass = '', ...props }, ref) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={wrapperClass}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />}
        <input ref={ref} required={required} {...aria(id, error, hint)} className={`${control(error)} h-11 ${Icon ? 'ps-10' : ''} ${className}`} {...props} />
      </div>
    </Field>
  );
});

export function Textarea({ label, error, hint, required, className = '', wrapperClass = '', rows = 4, ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={wrapperClass}>
      <textarea rows={rows} {...aria(id, error, hint)} className={`${control(error)} py-2.5 leading-6 ${className}`} {...props} />
    </Field>
  );
}

export function Select({ label, error, hint, required, options = [], placeholder, className = '', wrapperClass = '', children, ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={wrapperClass}>
      <select {...aria(id, error, hint)} className={`${control(error)} h-11 pe-8 ${className}`} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {children}
      </select>
    </Field>
  );
}

export function Switch({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-muted">{description}</span>}
      </label>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-primary-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'start-[1.375rem]' : 'start-0.5'}`} />
      </button>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'بحث…', className = '', label = 'بحث' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input type="search" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`${control(false)} h-11 ps-10 pe-9 [&::-webkit-search-cancel-button]:hidden`} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="مسح البحث" className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
