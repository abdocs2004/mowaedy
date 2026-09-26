import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, CheckCircle2, Eye, Plus, Store, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Avatar, Badge, Button, ConfirmDialog, DataTable, EmptyState, ErrorState, IconButton, Pagination, SearchInput, Select, Stars } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { formatDate, formatPrice } from '../../lib/format.js';
import { ProviderWizard } from './ProviderWizard.jsx';

export default function AdminProvidersPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setPage(1), [dq, category, isActive]);

  const cats = useFetch((signal) => api.get('/categories', { signal }));
  const { data, meta, loading, error, reload } = useFetch((signal) => api.get('/admin/providers', { signal, params: { q: dq, category, isActive, page, limit: 10 } }), [dq, category, isActive, page]);

  const toggleActive = async (p) => {
    try { const res = await api.patch(`/admin/providers/${p._id}`, { isActive: !p.isActive }); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const remove = async () => {
    setBusy(true);
    try { const res = await api.delete(`/admin/providers/${target._id}`); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); setTarget(null); }
  };

  const columns = [
    { key: 'provider', header: 'مقدم الخدمة', render: (p) => <Link to={`/admin/providers/${p._id}`} className="flex items-center gap-2.5 hover:underline"><Avatar src={p.image} name={p.name} className="h-9 w-9" /><div className="min-w-0"><p className="font-bold text-ink">{p.name}</p><p className="truncate text-xs text-ink-muted">{p.businessName}</p></div></Link> },
    { key: 'category', header: 'القسم', render: (p) => <Badge tone="blue">{p.category?.nameAr}</Badge> },
    { key: 'owner', header: 'الحساب', hideBelow: 'lg', render: (p) => <span className="ltr-num text-xs">{p.owner?.email}</span> },
    { key: 'rating', header: 'التقييم', hideBelow: 'md', render: (p) => <Stars value={p.rating?.avg || 0} count={p.rating?.count} size="h-3.5 w-3.5" /> },
    { key: 'status', header: 'الحالة', render: (p) => <Badge tone={p.isActive ? 'green' : 'red'} dot>{p.isActive ? 'نشط' : 'معطّل'}</Badge> },
    { key: 'joined', header: 'الانضمام', hideBelow: 'lg', render: (p) => formatDate(p.createdAt) },
    { key: 'actions', header: '', render: (p) => (
      <div className="flex items-center gap-1">
        <Link to={`/admin/providers/${p._id}`}><IconButton label="عرض"><Eye className="h-5 w-5" /></IconButton></Link>
        <IconButton label={p.isActive ? 'تعطيل' : 'تفعيل'} onClick={() => toggleActive(p)}>{p.isActive ? <Ban className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</IconButton>
        <IconButton label="حذف" variant="danger" onClick={() => setTarget(p)}><Trash2 className="h-5 w-5" /></IconButton>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="مقدمو الخدمة" description="إدارة الجيمات وصالونات الحلاقة والعيادات" actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> إضافة مقدم خدمة</Button>} />
      <div className="card mb-5 p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput value={q} onChange={setQ} placeholder="الاسم أو المدينة" className="sm:col-span-2" />
        <Select aria-label="القسم" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="كل الأقسام" options={(cats.data || []).map((c) => ({ value: c._id, label: c.nameAr }))} />
        <Select aria-label="الحالة" value={isActive} onChange={(e) => setIsActive(e.target.value)} placeholder="كل الحالات" options={[{ value: 'true', label: 'نشط' }, { value: 'false', label: 'معطّل' }]} />
      </div></div>

      <div className="card overflow-hidden">
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} empty={<EmptyState icon={Store} title="لا يوجد مقدمو خدمة" action={<Button onClick={() => setCreating(true)}>إضافة مقدم خدمة</Button>} />} />
        <div className="border-t border-slate-100 px-4 py-3"><Pagination meta={meta} onChange={setPage} /></div>
      </div>

      {creating && <ProviderWizard onClose={() => setCreating(false)} onSaved={() => { setCreating(false); reload(); }} />}
      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy} danger title="حذف مقدم الخدمة" confirmLabel="حذف"
        message={target && <>هل تريد حذف <b>{target.name}</b>؟ سيتم حذف حسابه أيضاً. لا يمكن الحذف إذا كان لديه مواعيد مسجلة (يمكن تعطيله بدلاً من ذلك).</>} />
    </div>
  );
}
