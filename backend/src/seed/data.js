/**
 * Development seed data.
 * The 18 providers (names, salons/clinics/gyms, streets, photos, star ratings) come from the original
 * frontend-only project. Cities, specialties, services and prices did not exist there and are sample values.
 */
export const categories = [
  { slug: 'gym', nameAr: 'جيم', singularAr: 'صالة رياضية', icon: 'dumbbell', image: '/images/gym.webp', order: 1, description: 'احجز حصتك مع أفضل المدربين والصالات الرياضية' },
  { slug: 'barber', nameAr: 'حلاق / صالون', singularAr: 'صالون حلاقة', icon: 'scissors', image: '/images/young-man-barbershop-trimming-hair.webp', order: 2, description: 'قصّة شعر وعناية بالمظهر بدون انتظار' },
  { slug: 'clinic', nameAr: 'طبيب / عيادة', singularAr: 'عيادة', icon: 'stethoscope', image: '/images/clinc.webp', order: 3, description: 'احجز كشفك عند أفضل الأطباء في مواعيد مناسبة' },
];

/** rating = stars shown in the original cards. */
export const providers = [
  // ---- barbers ----
  { category: 'barber', name: 'الحلاق سامي الوكيل', businessName: 'صالون جلاكسي', address: 'شارع المول', city: 'القاهرة', image: '/images/braber_five.webp', rating: 3, exp: 8, specialties: ['قصات كلاسيك', 'حلاقة الذقن'] },
  { category: 'barber', name: 'الحلاق شعبان', businessName: 'صالون نعنشة', address: 'شارع الفتح', city: 'الجيزة', image: '/images/braber_three.webp', rating: 4, exp: 12, specialties: ['قصات عصرية', 'تصفيف'] },
  { category: 'barber', name: 'الحلاق سامي', businessName: 'صالون جلامر', address: 'شارع المراغي', city: 'الإسكندرية', image: '/images/braber_two.webp', rating: 3, exp: 5, specialties: ['قصات الأطفال', 'حلاقة الذقن'] },
  { category: 'barber', name: 'الحلاق ماجد التابعي', businessName: 'صالون جلاكسي', address: 'شارع المول', city: 'القاهرة', image: '/images/young-man-barbershop-trimming-hair.webp', rating: 5, exp: 15, specialties: ['فيد', 'قصات عصرية', 'العناية باللحية'], autoConfirm: true },
  { category: 'barber', name: 'الحلاق محسن شريف', businessName: 'صالون لمعة', address: 'شارع جمال عبدالناصر', city: 'الجيزة', image: '/images/braber_four.webp', rating: 4, exp: 9, specialties: ['قصات كلاسيك', 'تصفيف'] },
  { category: 'barber', name: 'الحلاق محمد الحلو', businessName: 'صالون فبريكا', address: 'شارع الكنانة', city: 'التجمع الخامس', image: '/images/braber.webp', rating: 3, exp: 6, specialties: ['قصات عصرية'] },
  // ---- clinics ----
  { category: 'clinic', name: 'د. ابتسام محمود', businessName: 'عيادة الفتح', address: 'شارع الأهرام', city: 'الجيزة', image: '/images/doctor_two.webp', rating: 4, exp: 14, specialty: 'طب الأسنان' },
  { category: 'clinic', name: 'د. مي إبراهيم', businessName: 'عيادة الفؤاد', address: 'شارع المخابرات', city: 'القاهرة', image: '/images/doctor_three.webp', rating: 5, exp: 11, specialty: 'الجلدية والتجميل', autoConfirm: true },
  { category: 'clinic', name: 'د. جميلة ثروت', businessName: 'عيادة الجابري', address: 'شارع المركزي', city: 'الإسكندرية', image: '/images/doctor_five.webp', rating: 4, exp: 9, specialty: 'النساء والتوليد' },
  { category: 'clinic', name: 'د. أمين ممدوح', businessName: 'عيادة الأمل', address: 'شارع التحرير', city: 'القاهرة', image: '/images/doctor_four.webp', rating: 3, exp: 20, specialty: 'الباطنة' },
  { category: 'clinic', name: 'د. منال الصغيري', businessName: 'عيادة الفؤاد', address: 'شارع التوحيد', city: 'التجمع الخامس', image: '/images/clinc.webp', rating: 4, exp: 7, specialty: 'طب الأطفال' },
  { category: 'clinic', name: 'د. زياد السعيد', businessName: 'عيادة زياد التخصصية', address: 'شارع البستان', city: 'الجيزة', image: '/images/doctor_one.webp', rating: 4, exp: 16, specialty: 'العظام والمفاصل' },
  // ---- gyms ----
  { category: 'gym', name: 'كابتن أمين خليل', businessName: 'جيم فتنس باور', address: 'شارع الخزان', city: 'التجمع الخامس', image: '/images/gym_two.webp', rating: 5, exp: 10, specialties: ['بناء العضلات', 'تدريب القوة'], facilities: ['دشات', 'مواقف سيارات'] },
  { category: 'gym', name: 'كابتن سامح عبده', businessName: 'جيم فتنس داي', address: 'شارع العبور', city: 'التجمع الخامس', image: '/images/gym_one.webp', rating: 5, exp: 8, specialties: ['خسارة الوزن', 'لياقة عامة'], facilities: ['دشات', 'كافيه'], autoConfirm: true },
  { category: 'gym', name: 'كابتن صالح محمد', businessName: 'جيم القوة الناعمة', address: 'شارع محمد عبده', city: 'القاهرة', image: '/images/gym_three.webp', rating: 5, exp: 12, specialties: ['يوجا', 'مرونة'], facilities: ['دشات', 'قسم سيدات'] },
  { category: 'gym', name: 'كابتن لطفي خالد', businessName: 'جيم لايف باور', address: 'شارع اللؤلؤة', city: 'الإسكندرية', image: '/images/gym.webp', rating: 3, exp: 5, specialties: ['لياقة عامة'], facilities: ['دشات'] },
  { category: 'gym', name: 'كابتن رامي حسانين', businessName: 'جيم فتنس جلاكسي', address: 'شارع مكرم عبيد', city: 'القاهرة', image: '/images/gym_four.webp', rating: 5, exp: 13, specialties: ['كروس فيت', 'تدريب وظيفي'], facilities: ['دشات', 'مواقف سيارات', 'كافيه'] },
  { category: 'gym', name: 'كابتن رامي الدرع', businessName: 'جيم فتنس جلاكسي', address: 'شارع مكرم عبيد', city: 'القاهرة', image: '/images/gym_five.webp', rating: 4, exp: 7, specialties: ['ملاكمة', 'لياقة عامة'], facilities: ['دشات'] },
];

/** slotMinutes per category and the service templates (price is multiplied per provider). */
export const categoryConfig = {
  gym: {
    slotMinutes: 60,
    description: (p) => `${p.name} — مدرب لياقة بدنية في ${p.businessName}. برامج تدريب مخصصة لأهدافك مع متابعة مستمرة.`,
    services: [
      { name: 'حصة تدريب شخصي', description: 'حصة فردية مع المدرب وبرنامج مخصص', price: 250, durationMinutes: 60 },
      { name: 'حصة جماعية', description: 'حصة تدريب جماعية بأسلوب حماسي', price: 120, durationMinutes: 60 },
      { name: 'تقييم لياقة وخطة تغذية', description: 'قياسات الجسم وخطة تغذية مناسبة', price: 180, durationMinutes: 60 },
      { name: 'زيارة تجريبية', description: 'جرّب الصالة قبل الاشتراك', price: 80, durationMinutes: 60 },
    ],
  },
  barber: {
    slotMinutes: 30,
    description: (p) => `${p.name} في ${p.businessName}. خبرة في القصات الحديثة والكلاسيكية والعناية بالمظهر.`,
    services: [
      { name: 'قص شعر', description: 'قصّة حسب طلبك مع تصفيف', price: 100, durationMinutes: 30 },
      { name: 'حلاقة ذقن', description: 'تحديد وتهذيب اللحية', price: 60, durationMinutes: 30 },
      { name: 'قص شعر + ذقن', description: 'باقة كاملة للشعر واللحية', price: 150, durationMinutes: 60 },
      { name: 'عناية بالبشرة وماسك', description: 'تنظيف بشرة مع ماسك منعش', price: 200, durationMinutes: 60 },
    ],
  },
  clinic: {
    slotMinutes: 30,
    description: (p) => `${p.name} — ${p.specialty}، تعمل في ${p.businessName}. مواعيد منظمة وكشف بدون انتظار طويل.`,
    services: [
      { name: 'كشف جديد', description: 'كشف وتشخيص أولي', price: 350, durationMinutes: 30 },
      { name: 'إعادة كشف (متابعة)', description: 'متابعة خلال أسبوعين من الكشف السابق', price: 200, durationMinutes: 30 },
      { name: 'استشارة سريعة', description: 'استشارة قصيرة لمراجعة نتائج التحاليل والأشعة', price: 150, durationMinutes: 30 },
    ],
  },
};

export const sampleUsers = [
  { name: 'أحمد محمود', phone: '01012345601' },
  { name: 'سارة علي', phone: '01112345602' },
  { name: 'محمد حسن', phone: '01212345603' },
  { name: 'نورهان سمير', phone: '01512345604' },
  { name: 'يوسف إبراهيم', phone: '01012345605' },
  { name: 'مريم خالد', phone: '01112345606' },
  { name: 'عمر عبدالله', phone: '01212345607' },
  { name: 'هدى فؤاد', phone: '01512345608' },
];

export const CREDENTIALS = {
  userPassword: 'User@12345',
  providerPassword: 'Provider@12345',
};
