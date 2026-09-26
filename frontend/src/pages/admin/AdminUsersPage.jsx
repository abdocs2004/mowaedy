import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Plus, ShieldAlert, Trash2, UserRoundSearch } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { PasswordInput } from '../../components/shared/PasswordInput.jsx';
import { Avatar, Badge, Button, ConfirmDialog, DataTable, EmptyState, ErrorState, IconButton, Input, Modal, Pagination, SearchInput, Select } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { ROLE_LABEL, formatDate } from '../../lib/format.js';
import { rules } from '../../lib/validators.js';

const roleOptions = [{ value: 'user', label: 'عميل' }, { value: 'admin', label: 'مدير' }];

function CreateUserModal({ onClose, onSaved }) {
  const toast = useToast();
  const form = useForm({ name: '', email: '', phone: '', password: '', role: 'user' }, { name: rules.name, email: rules.email, phone: rules.phone, password: rules.password });
  const submit = form.handleSubmit(async (v) => {
    try {
      const res = await api.post('/admin/users', { ...v, phone: v.phone || undefined });
      toast.success(res.message);
      onSaved();
    } catch (err) { if (err.errors) throw err; toast.error(err.message); }
  });
  return (
    <Modal open onClose={onClose} title="إضافة مستخدم" footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button form="user-form" type="submit" loading={form.submitting}>إضافة</Button></>}>
      <form id="user-form" onSubmit={submit} noValidate className="space-y-4">
        <Input label="الاسم" required {...form.bind('name')} />
        <Input label="البريد الإلكتروني" type="email" required {...form.bind('email')} />
        <Input label="رقم الهاتف" type="tel" {...form.bind('phone')} />
        <PasswordInput label="كلمة المرور" required hint="8 أحرف على الأقل، حروف وأرقام" {...form.bind('password')} />
        <Select label="الصلاحية" options={roleOptions} {...form.bind('role')} />
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const form = useForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, isActive: user.isActive }, { name: rules.name, email: rules.email });
  const submit = form.handleSubmit(async (v) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}`, v);
      toast.success(res.message);
      onSaved();
    } catch (err) { if (err.errors) throw err; toast.error(err.message); }
  });
  return (
    <Modal open onClose={onClose} title="تعديل المستخدم" footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button form="edit-user-form" type="submit" loading={form.submitting}>حفظ</Button></>}>
      <form id="edit-user-form" onSubmit={submit} noValidate className="space-y-4">
        <Input label="الاسم" required {...form.bind('name')} />
        <Input label="البريد الإلكتروني" type="email" required {...form.bind('email')} />
        <Input label="رقم الهاتف" type="tel" {...form.bind('phone')} />
        <Select label="الصلاحية" options={roleOptions} disabled={user.role === 'provider'} hint={user.role === 'provider' ? 'حسابات مقدمي الخدمة تُدار من قسم مقدمي الخدمة' : ''} {...form.bind('role')} />
        <label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={form.values.isActive} onChange={(e) => form.set('isActive', e.target.checked)} /> الحساب نشط</label>
      </form>
    </Modal>
  );
}

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setPage(1), [dq, role]);

  const { data, meta, loading, error, reload } = useFetch((signal) => api.get('/admin/users', { signal, params: { q: dq, role, page, limit: 10 } }), [dq, role, page]);

  const toggleActive = async (u) => {
    try { const res = await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive }); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const remove = async () => {
    setBusy(true);
    try { const res = await api.delete(`/admin/users/${target._id}`); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); setTarget(null); }
  };

  const columns = [
    { key: 'user', header: 'المستخدم', render: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.name} className="h-9 w-9" /><div className="min-w-0"><p className="font-bold text-ink">{u.name}</p><p className="ltr-num truncate text-xs text-ink-muted">{u.email}</p></div></div> },
    { key: 'phone', header: 'الهاتف', hideBelow: 'md', render: (u) => <span className="ltr-num">{u.phone || '—'}</span> },
    { key: 'role', header: 'الصلاحية', render: (u) => <Badge tone={u.role === 'admin' ? 'purple' : u.role === 'provider' ? 'blue' : 'gray'}>{ROLE_LABEL[u.role]}</Badge> },
    { key: 'status', header: 'الحالة', render: (u) => <Badge tone={u.isActive ? 'green' : 'red'} dot>{u.isActive ? 'نشط' : 'معطّل'}</Badge> },
    { key: 'joined', header: 'تاريخ الانضمام', hideBelow: 'lg', render: (u) => formatDate(u.createdAt) },
    { key: 'actions', header: '', render: (u) => u._id === me._id ? <span className="text-xs text-ink-muted">حسابك</span> : (
      <div className="flex items-center gap-1">
        <IconButton label={u.isActive ? 'تعطيل' : 'تفعيل'} onClick={() => toggleActive(u)}>{u.isActive ? <Ban className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</IconButton>
        <Button size="xs" variant="secondary" onClick={() => setEditing(u)}>تعديل</Button>
        {u.role !== 'provider' && <IconButton label="حذف" variant="danger" onClick={() => setTarget(u)}><Trash2 className="h-5 w-5" /></IconButton>}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="المستخدمون" description="إدارة حسابات العملاء والمديرين" actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> إضافة مستخدم</Button>} />
      <div className="card mb-5 p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SearchInput value={q} onChange={setQ} placeholder="الاسم أو البريد أو الهاتف" className="sm:col-span-2" />
        <Select aria-label="الصلاحية" value={role} onChange={(e) => setRole(e.target.value)} placeholder="كل الصلاحيات" options={[...roleOptions, { value: 'provider', label: 'مقدم خدمة' }]} />
      </div></div>

      <div className="card overflow-hidden">
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} empty={<EmptyState icon={UserRoundSearch} title="لا يوجد مستخدمون" description="جرّب تعديل البحث." />} />
        <div className="border-t border-slate-100 px-4 py-3"><Pagination meta={meta} onChange={setPage} /></div>
      </div>

      {creating && <CreateUserModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); reload(); }} />}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy} danger title="حذف المستخدم" confirmLabel="حذف"
        message={target && <>هل تريد حذف <b>{target.name}</b>؟ لا يمكن حذف مستخدم لديه مواعيد مسجلة (يمكن تعطيله بدلاً من ذلك).</>}>
        {target?.role === 'admin' && <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800"><ShieldAlert className="h-4 w-4 shrink-0" /> لا يمكن حذف آخر مدير في المنصة.</p>}
      </ConfirmDialog>
    </div>
  );
}
