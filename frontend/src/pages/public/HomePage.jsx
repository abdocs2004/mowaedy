import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Clock, Mail, MapPin, MessageCircle, Phone, Search, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Input, LinkButton, Stars, Textarea } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import { categoryIcon } from '../../lib/categories.js';
import { reviews, site } from '../../lib/siteConfig.js';
import { rules } from '../../lib/validators.js';

const categoryCopy = {
  gym: { title: 'الصالات الرياضية', text: 'اختر حصتك التدريبية أو مدربك الخاص واحجز مكانك', image: '/images/gym.webp' },
  barber: { title: 'صالونات الحلاقة', text: 'احجز موعدك مع حلاقك المفضل بلمسة زر', image: '/images/young-man-barbershop-trimming-hair.webp' },
  clinic: { title: 'العيادات الطبية', text: 'ابحث عن أفضل الأطباء والاستشاريين', image: '/images/clinc.webp' },
};

const steps = [
  { icon: Search, title: 'ابحث واختر', text: 'تصفح مقدمي الخدمة حسب القسم أو المنطقة أو الخدمة المطلوبة.' },
  { icon: Clock, title: 'حدد الوقت المناسب', text: 'شاهد المواعيد المتاحة فعلياً واختر اليوم والساعة التي تناسبك.' },
  { icon: CalendarCheck, title: 'أكّد حجزك', text: 'احصل على تأكيد فوري وتابع مواعيدك من حسابك في أي وقت.' },
];

function Hero() {
  const navigate = useNavigate();
  const { data: categories } = useFetch((signal) => api.get('/categories', { signal }));
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (category) p.set('category', category);
    navigate(`/providers?${p}`);
  };
  return (
    <section className="relative isolate overflow-hidden bg-ink" id="home">
      <img src="/images/reception.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
      <div className="container-page py-20 text-center sm:py-28 lg:py-32">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur"><Sparkles className="h-4 w-4 text-amber-300" /> منصة الحجز الموحدة</span>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">احجز خدمتك في ثوانٍ</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">منصتك الموحدة للعثور على أفضل مقدمي الخدمات وحجز مواعيدك بسهولة تامة</p>

        <form onSubmit={submit} className="mx-auto mt-9 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-pop sm:flex-row" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="ابحث باسم مقدم الخدمة" placeholder="ابحث باسم الطبيب أو الحلاق أو الجيم…" className="h-12 w-full rounded-xl bg-transparent ps-12 pe-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="القسم" className="h-12 rounded-xl border-0 bg-slate-100 px-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary-500/30 sm:w-48">
            <option value="">كل الأقسام</option>
            {(categories || []).map((c) => <option key={c._id} value={c.slug}>{c.nameAr}</option>)}
          </select>
          <Button type="submit" size="lg" className="sm:px-8">بحث</Button>
        </form>
        <div className="mt-6"><Link to="/#service" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white">إكتشف الخدمات <ArrowLeft className="h-4 w-4" /></Link></div>
      </div>
    </section>
  );
}

function Categories() {
  const { data: categories, loading } = useFetch((signal) => api.get('/categories', { signal }));
  return (
    <section id="service" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold">خدماتنا المتاحة</h2>
        <p className="mt-3 text-ink-muted">اختر الفئة التي تبحث عنها لتبدأ رحلة الحجز</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-80" />)}
        {(categories || []).map((c) => {
          const copy = categoryCopy[c.slug] || {};
          const Icon = categoryIcon(c.slug);
          return (
            <Link key={c._id} to={`/providers?category=${c.slug}`} className="group card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-pop">
              <div className="relative h-52 overflow-hidden">
                <img src={copy.image || c.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-4 start-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-700 shadow"><Icon className="h-6 w-6" /></span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{copy.title || c.nameAr}</h3>
                <p className="mt-1.5 min-h-[3rem] text-sm leading-6 text-ink-muted">{copy.text || c.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary-700">عرض مقدمي الخدمة <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="container-page">
        <h2 className="mb-10 text-center text-3xl font-extrabold">كيف تعمل المنصة؟</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl bg-surface-muted p-6 text-center">
              <span className="absolute inset-x-0 -top-3 mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700"><s.icon className="h-7 w-7" /></span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-20 bg-surface-sunken py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold">آراء عملائنا الكرام</h2>
          <p className="mt-3 text-ink-muted">شهادات نفخر بها ونسعى دائماً للأفضل بفضل ثقتكم</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="card flex flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <img src={r.image} alt="" loading="lazy" className="h-14 w-14 rounded-full object-cover ring-2 ring-primary-100" />
                <div><figcaption className="font-bold text-ink">{r.name}</figcaption><Stars value={r.rating} /></div>
              </div>
              <blockquote className="text-sm leading-7 text-ink-soft">“{r.text}”</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const toast = useToast();
  const form = useForm({ name: '', email: '', subject: '', message: '' }, {
    name: rules.name, email: rules.email,
    message: (v) => (!v.trim() ? 'الرسالة مطلوبة' : v.trim().length < 5 ? 'الرسالة قصيرة جداً' : ''),
  });
  const submit = form.handleSubmit(async (v) => {
    try {
      const res = await api.post('/contact', v);
      toast.success(res.message);
      form.reset();
    } catch (err) {
      if (err.errors) throw err;
      toast.error(err.message);
    }
  });
  const info = [
    { icon: Mail, label: 'البريد الإلكتروني', value: site.email, href: `mailto:${site.email}`, ltr: true },
    { icon: Phone, label: 'واتساب', value: site.phone, href: site.whatsapp, ltr: true },
    { icon: MapPin, label: 'العنوان', value: site.address, href: site.mapUrl },
  ];
  return (
    <section id="contact" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold">هل تحتاج إلى مساعدة؟</h2>
        <p className="mt-3 text-ink-muted">فريقنا جاهز للرد على جميع استفساراتك.</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-5">
        <form onSubmit={submit} noValidate className="card space-y-4 p-6 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" required placeholder="اكتب اسمك الكريم" autoComplete="name" {...form.bind('name')} />
            <Input label="البريد الإلكتروني" type="email" required placeholder="you@example.com" autoComplete="email" {...form.bind('email')} />
          </div>
          <Input label="الموضوع" placeholder="موضوع الرسالة" maxLength={120} {...form.bind('subject')} />
          <Textarea label="رسالتك" required placeholder="اكتب رسالتك هنا…" maxLength={1000} hint={`${form.values.message.length}/1000`} {...form.bind('message')} />
          <Button type="submit" size="lg" block loading={form.submitting}><Send className="h-4 w-4 rtl:-scale-x-100" /> إرسال الرسالة</Button>
        </form>
        <aside className="rounded-2xl bg-ink p-6 text-white lg:col-span-2">
          <h3 className="text-lg font-bold text-white">تواصل معنا مباشرة</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">لا تتردد في التواصل إذا كان لديك أي استفسار.</p>
          <ul className="mt-6 space-y-5">
            {info.map((i) => (
              <li key={i.label} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><i.icon className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="text-xs text-slate-400">{i.label}</p>
                  <a href={i.href} target={i.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-words text-sm font-semibold hover:text-primary-300"><span className={i.ltr ? 'ltr-num' : ''}>{i.value}</span></a></div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs text-slate-200"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" /> نرد عادةً خلال يوم عمل واحد.</div>
        </aside>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (<><Hero /><Categories /><HowItWorks /><Reviews /><Contact /></>);
}
