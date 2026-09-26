import { useState } from 'react';
import { Pencil, Plus, Timer, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, Modal, Skeleton, Switch, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { formatDuration, formatPrice } from '../../lib/format.js';

function ServiceForm({ service, slotMinutes, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(service);
  const form = useForm(
    { name: service?.name || '', description: service?.description || '', price: service?.price ?? '', durationMinutes: service?.durationMinutes ?? slotMinutes, isActive: service?.isActive ?? true },
    { name: (v) => (!v.trim() ? 'اسم الخدمة مطلوب' : v.trim().length < 2 ? 'اسم الخدمة قصير جداً' : ''),
      price: (v) => (v === '' || v === null ? 'السعر مطلوب' : Number(v) < 0 ? 'السعر لا يمكن أن يكون سالباً' : ''),
      durationMinutes: (v) => (!v ? 'المدة مطلوبة' : Number(v) % slotMinutes !== 0 ? `يجب أن تكون من مضاعفات ${slotMinutes} دقيقة` : '') }
  );

  const submit = form.handleSubmit(async (v) => {
    const body = { name: v.name.trim(), description: v.description.trim(), price: Number(v.price), durationMinutes: Number(v.durationMinutes), isActive: v.isActive };
    try {
      const res = editing ? await api.patch(`/provider/services/${service._id}`, body) : await api.post('/provider/services', body);
      toast.success(res.message);
      onSaved();
    } catch (err) { if (err.errors) throw err; toast.error(err.message); }
  });

  return (
    <Modal open onClose={onClose} title={editing ? 'تعديل الخدمة' : 'إضافة خدمة'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button form="svc-form" type="submit" loading={form.submitting}>حفظ</Button></>}>
      <form id="svc-form" onSubmit={submit} noValidate className="space-y-4">
        <Input label="اسم الخدمة" required {...form.bind('name')} />
        <Textarea label="الوصف (اختياري)" rows={3} maxLength={500} {...form.bind('description')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="السعر (ج.م)" type="number" min={0} required {...form.bind('price')} />
          <Input label="المدة (دقيقة)" type="number" min={5} step={slotMinutes} required hint={`مضاعفات ${slotMinutes}`} {...form.bind('durationMinutes')} />
        </div>
        {editing && <Switch checked={form.values.isActive} onChange={(v) => form.set('isActive', v)} label="الخدمة مفعّلة" description="عند الإيقاف لن تظهر الخدمة للعملاء" />}
      </form>
    </Modal>
  );
}

export default function ProviderServicesPage() {
  const toast = useToast();
  const { data: profile } = useFetch((signal) => api.get('/provider/me', { signal }));
  const { data, loading, error, reload } = useFetch((signal) => api.get('/provider/services', { signal }));
  const [editing, setEditing] = useState(null); // null=closed, {}=new, service=edit
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { const res = await api.delete(`/provider/services/${target._id}`); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); setTarget(null); }
  };

  return (
    <div>
      <PageHeader title="الخدمات" description="أضف خدماتك وأسعارها ومددها" actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> إضافة خدمة</Button>} />
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && !data && [0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}
          {(data || []).map((s) => (
            <div key={s._id} className={`card p-4 ${!s.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2"><h3 className="font-bold text-ink">{s.name}</h3>{!s.isActive && <Badge tone="gray">معطّلة</Badge>}</div>
              {s.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{s.description}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted"><Timer className="h-3.5 w-3.5" /> {formatDuration(s.durationMinutes)}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-lg font-extrabold text-primary-700">{formatPrice(s.price)}</span>
                <div className="flex gap-1"><Button size="xs" variant="secondary" onClick={() => setEditing(s)}><Pencil className="h-3.5 w-3.5" /> تعديل</Button><Button size="xs" variant="danger-soft" onClick={() => setTarget(s)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
              </div>
            </div>
          ))}
          {!loading && data?.length === 0 && <div className="card sm:col-span-2 lg:col-span-3"><EmptyState title="لا توجد خدمات بعد" description="أضف أول خدمة ليتمكن العملاء من حجزها." action={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> إضافة خدمة</Button>} /></div>}
        </div>
      )}
      {editing && profile && <ServiceForm service={editing._id ? editing : null} slotMinutes={profile.slotMinutes} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy} danger title="حذف الخدمة" confirmLabel="حذف"
        message={target && <>هل تريد حذف خدمة <b>{target.name}</b>؟ إذا كانت مرتبطة بمواعيد سابقة سيتم تعطيلها بدلاً من حذفها.</>} />
    </div>
  );
}
