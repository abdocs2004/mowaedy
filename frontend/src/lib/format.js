const LOCALE = 'ar-EG-u-nu-latn'; // Arabic text, Western digits (easier for phones/prices)
const TZ = 'Africa/Cairo';

export const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
/** Egyptian week order: Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

export const STATUS = {
  pending: { label: 'قيد الانتظار', tone: 'amber' },
  confirmed: { label: 'مؤكد', tone: 'blue' },
  completed: { label: 'مكتمل', tone: 'green' },
  cancelled: { label: 'ملغي', tone: 'red' },
};
export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }));
export const TRANSITIONS = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: [] };

export const ROLE_LABEL = { user: 'عميل', provider: 'مقدم خدمة', admin: 'مدير' };

const fmt = (opts) => new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, ...opts });
const cache = {
  date: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  short: fmt({ day: 'numeric', month: 'short', year: 'numeric' }),
  time: fmt({ hour: 'numeric', minute: '2-digit', hour12: true }),
  dateTime: fmt({ day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }),
  weekdayShort: fmt({ weekday: 'short' }),
  day: fmt({ day: 'numeric' }),
  month: fmt({ month: 'short' }),
};

export const formatDate = (v) => (v ? cache.date.format(new Date(v)) : '—');
export const formatShortDate = (v) => (v ? cache.short.format(new Date(v)) : '—');
export const formatTime = (v) => (v ? cache.time.format(new Date(v)) : '—');
export const formatDateTime = (v) => (v ? cache.dateTime.format(new Date(v)) : '—');
export const formatPrice = (n) => (n === null || n === undefined ? '—' : n === 0 ? 'مجاناً' : `${new Intl.NumberFormat(LOCALE).format(n)} ج.م`);
export const formatNumber = (n) => new Intl.NumberFormat(LOCALE).format(n ?? 0);
export const formatDuration = (min) => {
  if (min < 60) return `${min} دقيقة`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ساعة و${m} دقيقة` : h === 1 ? 'ساعة' : h === 2 ? 'ساعتان' : `${h} ساعات`;
};

/** "YYYY-MM-DD" parts for the date picker (noon UTC avoids any timezone shift). */
export function dateParts(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const opts = (o) => new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...o }).format(d);
  return { weekday: opts({ weekday: 'short' }), day: opts({ day: 'numeric' }), month: opts({ month: 'short' }), long: opts({ weekday: 'long', day: 'numeric', month: 'long' }) };
}

/** "HH:mm" (24h) -> "5:30 م" */
export function formatHHmm(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export const initials = (name = '') => name.replace(/^(د\.|كابتن|الحلاق)\s*/, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

/** Builds a wa.me link from a local/international phone number (defaults to Egypt +20). */
export function whatsappLink(phone = '') {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = `20${d.slice(1)}`;
  return d ? `https://wa.me/${d}` : '';
}
