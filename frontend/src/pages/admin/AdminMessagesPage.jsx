import { useState } from 'react';
import { Mail, MailOpen, MessageSquareOff, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Pagination, Skeleton, Tabs } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';

const TABS = [{ value: '', label: 'الكل' }, { value: 'false', label: 'غير مقروءة' }, { value: 'true', label: 'مقروءة' }];

export default function AdminMessagesPage() {
  const toast = useToast();
  const [isRead, setIsRead] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, meta, loading, error, reload } = useFetch((signal) => api.get('/admin/messages', { signal, params: { isRead, page, limit: 8 } }), [isRead, page]);

  const toggleRead = async (m) => {
    try { await api.patch(`/admin/messages/${m._id}`, { isRead: !m.isRead }); reload(); } catch (err) { toast.error(err.message); }
  };
  const remove = async () => {
    setBusy(true);
    try { const res = await api.delete(`/admin/messages/${target._id}`); toast.success(res.message); reload(); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); setTarget(null); }
  };

  return (
    <div>
      <PageHeader title="الرسائل" description="رسائل نموذج التواصل من الزوار" actions={<Tabs tabs={TABS} value={isRead} onChange={(v) => { setIsRead(v); setPage(1); }} />} />
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="space-y-3">
          {loading && !data && [0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
          {(data || []).map((m) => (
            <article key={m._id} className={`card p-4 sm:p-5 ${!m.isRead ? 'border-primary-200 bg-primary-50/40' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-bold text-ink">{m.name}</h3>{!m.isRead && <Badge tone="blue" dot>جديدة</Badge>}</div>
                  <p className="ltr-num text-sm text-ink-muted">{m.email}</p></div>
                <span className="whitespace-nowrap text-xs text-ink-muted">{formatDateTime(m.createdAt)}</span>
              </div>
              {m.subject && <p className="mt-2 text-sm font-semibold text-ink">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-ink-soft">{m.message}</p>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <a href={`mailto:${m.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-primary-700 hover:bg-primary-50">رد بالبريد</a>
                <Button size="xs" variant="secondary" onClick={() => toggleRead(m)}>{m.isRead ? <><Mail className="h-3.5 w-3.5" /> تعليم كغير مقروءة</> : <><MailOpen className="h-3.5 w-3.5" /> تعليم كمقروءة</>}</Button>
                <Button size="xs" variant="danger-soft" onClick={() => setTarget(m)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </article>
          ))}
          {!loading && data?.length === 0 && <div className="card"><EmptyState icon={MessageSquareOff} title="لا توجد رسائل" /></div>}
          <Pagination meta={meta} onChange={setPage} className="pt-2" />
        </div>
      )}
      <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy} danger title="حذف الرسالة" confirmLabel="حذف" message="هل تريد حذف هذه الرسالة؟" />
    </div>
  );
}
