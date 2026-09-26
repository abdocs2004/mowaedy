// Client-side validation mirrors the backend rules (Arabic messages). The server stays the source of truth.
export const rules = {
  required: (msg) => (v) => (String(v ?? '').trim() ? '' : msg),
  email: (v) => (!String(v).trim() ? 'البريد الإلكتروني مطلوب' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'البريد الإلكتروني غير صالح'),
  phone: (v) => {
    const s = String(v || '').replace(/[\s-]/g, '');
    if (!s) return 'رقم الهاتف مطلوب';
    return /^\+?\d{10,15}$/.test(s) ? '' : 'رقم الهاتف غير صالح';
  },
  name: (v) => {
    const s = String(v || '').trim();
    return !s ? 'الاسم مطلوب' : s.length < 2 ? 'الاسم يجب ألا يقل عن حرفين' : '';
  },
  password: (v) => {
    if (!v) return 'كلمة المرور مطلوبة';
    if (v.length < 8) return 'كلمة المرور يجب ألا تقل عن 8 أحرف';
    if (!/[A-Za-z\u0600-\u06FF]/.test(v)) return 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل';
    if (!/\d/.test(v)) return 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    return '';
  },
};

/** validate(values, { field: rule | [rules] }) -> { field: message } (empty object = valid) */
export function validate(values, schema) {
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    for (const r of [].concat(rule)) {
      const msg = r(values[field], values);
      if (msg) { errors[field] = msg; break; }
    }
  }
  return errors;
}
