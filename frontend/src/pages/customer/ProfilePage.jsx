import { KeyRound, UserRound } from 'lucide-react';
import { PasswordInput } from '../../components/shared/PasswordInput.jsx';
import { Button, Input } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { ROLE_LABEL } from '../../lib/format.js';
import { rules } from '../../lib/validators.js';

/** Used for every role (customer, provider, admin). */
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const info = useForm({ name: user.name, phone: user.phone || '' }, { name: rules.name, phone: rules.phone });
  const saveInfo = info.handleSubmit(async (v) => {
    try {
      const res = await api.patch('/auth/me', { name: v.name.trim(), phone: v.phone });
      setUser(res.data.user);
      toast.success(res.message);
    } catch (err) { if (err.errors) throw err; toast.error(err.message); }
  });

  const pw = useForm({ currentPassword: '', newPassword: '', confirm: '' }, {
    currentPassword: rules.required('كلمة المرور الحالية مطلوبة'), newPassword: rules.password,
    confirm: (v, all) => (v !== all.newPassword ? 'كلمتا المرور غير متطابقتين' : ''),
  });
  const savePw = pw.handleSubmit(async (v) => {
    try {
      const res = await api.patch('/auth/password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast.success(res.message);
      pw.reset();
    } catch (err) {
      if (err.errors) throw err;
      if (err.code === 'WRONG_PASSWORD') pw.setErrors({ currentPassword: err.message }); else toast.error(err.message);
    }
  });

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-extrabold">حسابي</h1>
      <div className="space-y-6">
        <form onSubmit={saveInfo} noValidate className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><UserRound className="h-5 w-5 text-primary-600" /> البيانات الشخصية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" required autoComplete="name" {...info.bind('name')} />
            <Input label="رقم الهاتف" type="tel" required autoComplete="tel" {...info.bind('phone')} />
            <Input label="البريد الإلكتروني" value={user.email} disabled readOnly hint="لا يمكن تغيير البريد الإلكتروني" />
            <Input label="نوع الحساب" value={ROLE_LABEL[user.role]} disabled readOnly />
          </div>
          <div className="flex justify-end"><Button type="submit" loading={info.submitting}>حفظ التغييرات</Button></div>
        </form>

        <form onSubmit={savePw} noValidate className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-primary-600" /> تغيير كلمة المرور</h2>
          <PasswordInput label="كلمة المرور الحالية" required autoComplete="current-password" {...pw.bind('currentPassword')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput label="كلمة المرور الجديدة" required autoComplete="new-password" hint="8 أحرف على الأقل، حروف وأرقام" {...pw.bind('newPassword')} />
            <PasswordInput label="تأكيد كلمة المرور" required autoComplete="new-password" {...pw.bind('confirm')} />
          </div>
          <div className="flex justify-end"><Button type="submit" loading={pw.submitting}>تغيير كلمة المرور</Button></div>
        </form>
      </div>
    </div>
  );
}
