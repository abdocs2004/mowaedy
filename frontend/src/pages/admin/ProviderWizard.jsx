import { useMemo, useState } from 'react';
import { PasswordInput } from '../../components/shared/PasswordInput.jsx';
import { Button, Input, Modal, Select, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { providerImages } from '../../lib/siteConfig.js';
import { rules } from '../../lib/validators.js';

const STEPS = ['البيانات الأساسية', 'الحساب', 'المراجعة'];

/** Create-provider wizard: profile -> owner account -> review. Working hours default to the category's usual schedule (server-side). */
export function ProviderWizard({ onClose, onSaved }) {
  const toast = useToast();
  const cats = useFetch((signal) => api.get('/categories', { signal }));
  const [step, setStep] = useState(0);

  const profile = useForm({ name: '', businessName: '', category: '', city: '', address: '', description: '', image: providerImages[0] }, {
    name: rules.name, category: (v) => (!v ? 'القسم مطلوب' : ''), city: (v) => (!v.trim() ? 'المدينة مطلوبة' : ''), address: (v) => (!v.trim() ? 'العنوان مطلوب' : ''),
  });
  const owner = useForm({ ownerName: '', email: '', phone: '', password: '' }, { ownerName: rules.name, email: rules.email, phone: rules.phone, password: rules.password });

  const selectedCat = (cats.data || []).find((c) => c._id === profile.values.category);

  const next = () => { if (step === 0) profile.handleSubmit(() => setStep(1))(); else owner.handleSubmit(() => setStep(2))(); };
  const [submitting, setSubmitting] = useState(false);
  const create = async () => {
    setSubmitting(true);
    try {
      const p = profile.values, o = owner.values;
      const res = await api.post('/admin/providers', {
        owner: { name: o.ownerName.trim(), email: o.email.trim(), phone: o.phone, password: o.password },
        category: p.category, name: p.name.trim(), businessName: p.businessName.trim(), city: p.city.trim(), address: p.address.trim(), description: p.description.trim(), image: p.image,
      });
      toast.success(res.message);
      onSaved();
    } catch (err) {
      toast.error(err.message);
      if (err.errors) setStep(err.errors.email || err.errors.ownerName || err.errors.phone || err.errors.password ? 1 : 0);
    } finally { setSubmitting(false); }
  };

  return (
    <Modal open onClose={onClose} size="lg" title="إضافة مقدم خدمة" description={STEPS[step]}
      footer={<>
        <Button variant="secondary" onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}>{step === 0 ? 'إلغاء' : 'رجوع'}</Button>
        {step < 2 ? <Button onClick={next}>التالي</Button> : <Button onClick={create} loading={submitting}>إنشاء مقدم الخدمة</Button>}
      </>}>
      <div className="mb-6 flex gap-2">{STEPS.map((s, i) => <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-slate-200'}`} />)}</div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" required placeholder="د. أحمد علي / كابتن محمد" {...profile.bind('name')} />
            <Select label="القسم" required placeholder="اختر القسم" options={(cats.data || []).map((c) => ({ value: c._id, label: c.nameAr }))} {...profile.bind('category')} />
            <Input label="اسم النشاط" placeholder="عيادة الأمل" {...profile.bind('businessName')} />
            <Input label="المدينة" required {...profile.bind('city')} />
          </div>
          <Input label="العنوان" required {...profile.bind('address')} />
          <Textarea label="الوصف (اختياري)" rows={3} maxLength={1500} {...profile.bind('description')} />
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">صورة الملف</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">{providerImages.map((src) => (
              <button type="button" key={src} onClick={() => profile.set('image', src)} className={`overflow-hidden rounded-xl border-2 ${profile.values.image === src ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-transparent'}`}><img src={src} alt="" className="aspect-square w-full object-cover" /></button>
            ))}</div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">سيتم إنشاء حساب خاص بمقدم الخدمة ليتمكن من تسجيل الدخول وإدارة خدماته ومواعيده.</p>
          <Input label="اسم صاحب الحساب" required {...owner.bind('ownerName')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="البريد الإلكتروني" type="email" required {...owner.bind('email')} />
            <Input label="رقم الهاتف" type="tel" required {...owner.bind('phone')} />
          </div>
          <PasswordInput label="كلمة المرور" required hint="8 أحرف على الأقل، حروف وأرقام" {...owner.bind('password')} />
        </div>
      )}

      {step === 2 && (
        <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-surface-muted p-4 text-sm sm:grid-cols-2">
          {[['الاسم', profile.values.name], ['القسم', selectedCat?.nameAr], ['اسم النشاط', profile.values.businessName || '—'], ['المدينة', profile.values.city], ['العنوان', profile.values.address],
            ['صاحب الحساب', owner.values.ownerName], ['البريد الإلكتروني', owner.values.email], ['الهاتف', owner.values.phone]].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-ink-muted">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
          ))}
          <p className="text-xs text-ink-muted sm:col-span-2">سيتم تعيين ساعات عمل افتراضية للقسم، ويمكن لمقدم الخدمة تعديلها لاحقاً من لوحة التحكم الخاصة به.</p>
        </dl>
      )}
    </Modal>
  );
}
