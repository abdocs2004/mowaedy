import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Info } from 'lucide-react';
import { AuthShell } from '../../components/shared/AuthShell.jsx';
import { PasswordInput } from '../../components/shared/PasswordInput.jsx';
import { Button, Input } from '../../components/ui/index.js';
import { homeFor, useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';



export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const from = location.state?.from;
  const form = useForm({ email: '', password: '' }, { email: rules.email, password: rules.required('كلمة المرور مطلوبة') });

  if (user) return <Navigate to={from || homeFor(user)} replace />;

  const submit = form.handleSubmit(async (v) => {
    setFormError('');
    try {
      const u = await login(v.email.trim(), v.password);
      toast.success(`أهلاً بك، ${u.name}`);
      const target = u.role === 'user' ? from || '/' : from?.startsWith(homeFor(u)) ? from : homeFor(u);
      navigate(target, { replace: true });
    } catch (err) {
      if (err.errors) throw err;
      setFormError(err.message);
    }
  });

  return (
    <AuthShell title="تسجيل الدخول" subtitle="مرحباً بعودتك! سجّل دخولك لمتابعة مواعيدك."
      footer={<>ليس لديك حساب؟ <Link to="/register" className="font-bold text-primary-700 hover:underline">أنشئ حساباً جديداً</Link></>}>
      {location.state?.notice && !formError && <p className="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><Info className="mt-0.5 h-4 w-4 shrink-0" />{location.state.notice}</p>}
      {formError && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formError}</p>}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="البريد الإلكتروني" type="email" required autoComplete="email" placeholder="you@example.com" {...form.bind('email')} />
        <PasswordInput label="كلمة المرور" required autoComplete="current-password" placeholder="••••••••" {...form.bind('password')} />
        <Button type="submit" size="lg" block loading={form.submitting}>تسجيل الدخول</Button>
      </form>

    </AuthShell>
  );
}
