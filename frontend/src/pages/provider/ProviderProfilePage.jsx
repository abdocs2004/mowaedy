import { useEffect, useState } from 'react';
import { Clock, Save, Store } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Button, Input, Select, Switch, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { DAYS_AR, WEEK_ORDER } from '../../lib/format.js';
import { providerImages } from '../../lib/siteConfig.js';

function WorkingHoursEditor({ value, onChange }) {
  const byDay = new Map(value.map((d) => [d.day, d]));
  const update = (day, patch) => onChange(WEEK_ORDER.map((d) => {
    const cur = byDay.get(d) || { day: d, isOpen: false, start: '10:00', end: '18:00', breaks: [] };
    return d === day ? { ...cur, ...patch } : cur;
  }));
  return (
    <div className="space-y-2">
      {WEEK_ORDER.map((day) => {
        const d = byDay.get(day) || { day, isOpen: false, start: '10:00', end: '18:00' };
        return (
          <div key={day} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${d.isOpen ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
            <span className="w-24 shrink-0 font-semibold text-ink">{DAYS_AR[day]}</span>
            <Switch checked={d.isOpen} onChange={(v) => update(day, { isOpen: v })} label="" />
            {d.isOpen ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input type="time" value={d.start} onChange={(e) => update(day, { start: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm" aria-label={`بداية ${DAYS_AR[day]}`} />
                <span className="text-ink-muted">إلى</span>
                <input type="time" value={d.end} onChange={(e) => update(day, { end: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm" aria-label={`نهاية ${DAYS_AR[day]}`} />
              </div>
            ) : <span className="text-sm text-ink-muted">مغلق</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function ProviderProfilePage() {
  const toast = useToast();
  const { data, loading, reload } = useFetch((signal) => api.get('/provider/me', { signal }));
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  if (loading && !form) return <p className="text-ink-muted">جارٍ التحميل…</p>;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/provider/me', {
        name: form.name, businessName: form.businessName, description: form.description, image: form.image,
        city: form.city, address: form.address, phone: form.phone, whatsapp: form.whatsapp,
        slotMinutes: Number(form.slotMinutes), minNoticeMinutes: Number(form.minNoticeMinutes), maxAdvanceDays: Number(form.maxAdvanceDays),
        autoConfirm: form.autoConfirm, workingHours: form.workingHours,
      });
      setForm(res.data);
      toast.success(res.message);
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="ملف مقدم الخدمة" description="بيانات ملفك العام وإعدادات الحجز" />
      <form onSubmit={save} className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold"><Store className="h-5 w-5 text-primary-600" /> البيانات العامة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" required value={form.name} onChange={set('name')} />
            <Input label="اسم النشاط" value={form.businessName} onChange={set('businessName')} />
            <Input label="المدينة" value={form.city} onChange={set('city')} />
            <Input label="العنوان" value={form.address} onChange={set('address')} />
            <Input label="رقم الهاتف" type="tel" value={form.phone} onChange={set('phone')} />
            <Input label="رقم واتساب" type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
          </div>
          <Textarea label="الوصف" rows={4} maxLength={1500} value={form.description} onChange={set('description')} />
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">صورة الملف</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {providerImages.map((src) => (
                <button type="button" key={src} onClick={() => setForm((f) => ({ ...f, image: src }))} className={`overflow-hidden rounded-xl border-2 ${form.image === src ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-transparent'}`}>
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold"><Clock className="h-5 w-5 text-primary-600" /> إعدادات الحجز</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="مدة الفترة الزمنية" value={form.slotMinutes} onChange={set('slotMinutes')} options={[15, 20, 30, 45, 60].map((v) => ({ value: v, label: `${v} دقيقة` }))} hint="يجب أن تكون مدة كل خدمة من مضاعفاتها" />
            <Select label="الحد الأدنى للإشعار المسبق" value={form.minNoticeMinutes} onChange={set('minNoticeMinutes')} options={[0, 30, 60, 120, 240, 1440].map((v) => ({ value: v, label: v === 0 ? 'بدون حد' : v < 60 ? `${v} دقيقة` : `${v / 60} ساعة` }))} />
            <Select label="أقصى مدة للحجز مسبقاً" value={form.maxAdvanceDays} onChange={set('maxAdvanceDays')} options={[7, 14, 30, 60, 90].map((v) => ({ value: v, label: `${v} يوماً` }))} />
          </div>
          <Switch checked={form.autoConfirm} onChange={(v) => setForm((f) => ({ ...f, autoConfirm: v }))} label="التأكيد التلقائي للحجوزات" description="عند التفعيل يتم تأكيد كل حجز فور إتمامه دون الحاجة لموافقتك" />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-base font-bold">ساعات العمل</h2>
          <WorkingHoursEditor value={form.workingHours} onChange={(wh) => setForm((f) => ({ ...f, workingHours: wh }))} />
        </section>

        <div className="flex justify-end"><Button type="submit" size="lg" loading={saving}><Save className="h-4 w-4" /> حفظ التغييرات</Button></div>
      </form>
    </div>
  );
}
