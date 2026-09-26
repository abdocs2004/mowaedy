import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthShell } from '../../components/shared/AuthShell.jsx';
import { PasswordInput } from '../../components/shared/PasswordInput.jsx';
import { Button, Input } from '../../components/ui/index.js';
import { homeFor, useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const form = useForm({ name: '', email: '', phone: '', password: '', confirm: '' }, {
    name: rules.name, email: rules.email, phone: rules.phone, password: rules.password,
    confirm: (v, all) => (v !== all.password ? 'كلمتا المرور غير متطابقتين' : ''),
  });

  if (user) return <Navigate to={homeFor(user)} replace />;

  const submit = form.handleSubmit(async (v) => {
    setFormError('');
    try {
      const u = await register({ name: v.name.trim(), email: v.email.trim(), phone: v.phone, password: v.password });
      toast.success(`مرحباً بك في مواعيدي، ${u.name}`);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      if (err.errors) throw err;
      setFormError(err.message);
    }
  });

  return (
    <AuthShell title="إنشاء حساب جديد" subtitle="سجّل مجاناً وابدأ بحجز مواعيدك."
      footer={<>لديك حساب بالفعل؟ <Link to="/login" state={location.state} className="font-bold text-primary-700 hover:underline">سجّل الدخول</Link></>}>
      {formError && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formError}</p>}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="الاسم الكامل" required autoComplete="name" placeholder="اكتب اسمك الكريم" {...form.bind('name')} />
        <Input label="البريد الإلكتروني" type="email" required autoComplete="email" placeholder="you@example.com" {...form.bind('email')} />
        <Input label="رقم الهاتف" type="tel" required autoComplete="tel" placeholder="01xxxxxxxxx" {...form.bind('phone')} />
        <PasswordInput label="كلمة المرور" required autoComplete="new-password" placeholder="8 أحرف على الأقل" hint="8 أحرف على الأقل، وتحتوي على حروف وأرقام" {...form.bind('password')} />
        <PasswordInput label="تأكيد كلمة المرور" required autoComplete="new-password" placeholder="أعد كتابة كلمة المرور" {...form.bind('confirm')} />
        <Button type="submit" size="lg" block loading={form.submitting}>إنشاء الحساب</Button>
      </form>
    </AuthShell>
  );
}
