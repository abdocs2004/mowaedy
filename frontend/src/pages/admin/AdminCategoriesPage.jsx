import { useState } from 'react';
import { Pencil, Plus, Store, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, Modal, Skeleton, Switch, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { categoryIcon } from '../../lib/categories.js';

function CategoryModal({ category, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(category);
  const form = useForm(
    { slug: category?.slug || '', nameAr: category?.nameAr || '', singularAr: category?.singularAr || '', description: category?.description || '', isActive: category?.isActive ?? true },
    { slug: (v) => (!editing && !/^[a-z0-9-]{2,30}$/.test(v) ? 'أحرف إنجليزية صغيرة وأرقام وشرطات فقط' : ''), nameAr: (v) => (!v.trim() ? 'اسم القسم مطلوب' : '') }
  );
  const submit = form.handleSubmit(async (v) => {
    const body = editing ? { nameAr: v.nameAr, singularAr: v.singularAr, description: v.description, isActive: v.isActive } : v;
    try {
      const res = editing ? await api.patch(`/categories/${category._id}`, body) : await api.post('/categories', body);
      toast.success(res.message);
      onSaved();
    } catch (err) { if (err.errors) throw err; toast.error(err.message); }
  });
  return (
    <Modal open onClose={onClose} title={editing ? 'تعديل القسم' : 'إضافة قسم'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button form="cat-form" type="submit" loading={form.submitting}>حفظ</Button></>}>
      <form id="cat-form" onSubmit={submit} noValidate className="space-y-4">
        <Input label="المعرّف (بالإنجليزية)" required disabled={editing} placeholder="gym" hint="يُستخدم في الروابط ولا يمكن تغييره لاحقاً" {...form.bind('slug')} />
        <Input label="اسم القسم" required placeholder="جيم" {...form.bind('nameAr')} />
        <Input label="الاسم المفرد (لبطاقات مقدمي الخدمة)" placeholder="صالة رياضية" {...form.bind('singularAr')} />
        <Textarea label="الوصف" rows={2} maxLength={300} {...form.bind('description')} />
        {editing && <Switch checked={form.values.isActive} onChange={(v) => form.set('isActive', v)} label="القسم مفعّل" description="الأقسام المعطّلة لا تظهر للعملاء" />}
      </form>
    </Modal>
  );
}

export default function AdminCategoriesPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((signal) => api.get('/categories', { signal, params: { all: true } }));
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { const res = await api.delete(`/categories/${target._id}`); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); setTarget(null); }
  };

  return (
    <div>
      <PageHeader title="الأقسام" description="أقسام مقدمي الخدمة الظاهرة في الموقع" actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> إضافة قسم</Button>} />
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && !data && [0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
          {(data || []).map((c) => {
            const Icon = categoryIcon(c.slug);
            return (
              <div key={c._id} className={`card p-4 ${!c.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon className="h-5 w-5" /></span>
                  {!c.isActive && <Badge tone="gray">معطّل</Badge>}
                </div>
                <h3 className="mt-3 font-bold text-ink">{c.nameAr}</h3>
                <p className="text-xs text-ink-muted ltr-num">/{c.slug}</p>
                {c.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{c.description}</p>}
                <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3">
                  <Button size="xs" variant="secondary" onClick={() => setEditing(c)}><Pencil className="h-3.5 w-3.5" /> تعديل</Button>
                  <Button size="xs" variant="danger-soft" onClick={() => setTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            );
          })}
          {!loading && data?.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={Store} title="لا توجد أقسام" action={<Button onClick={() => setEditing({})}>إضافة قسم</Button>} /></div>}
        </div>
      )}
      {editing && <CategoryModal category={editing.slug ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy} danger title="حذف القسم" confirmLabel="حذف"
        message={target && <>هل تريد حذف قسم <b>{target.nameAr}</b>؟ لا يمكن الحذف إذا كان مرتبطاً بمقدمي خدمة (يمكن تعطيله بدلاً من ذلك).</>} />
    </div>
  );
}
