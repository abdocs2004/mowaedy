/** Contact details shown on the landing page and footer. Edit here — nothing else needs to change. */
export const site = {
  name: 'مواعيدي',
  email: 'abdo.cs.2004@gmail.com',
  phone: '+20 1025967218',
  whatsapp: 'https://wa.me/201025967218',
  address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
  mapUrl: 'https://www.google.com/maps?q=' + encodeURIComponent('شارع الملك فهد, الرياض, المملكة العربية السعودية'),
  social: {
    threads: 'https://www.threads.com/@abdelrahiman_ibrahim.2004',
    instagram: 'https://www.instagram.com/abdelrahiman_ibrahim.2004/',
    facebook: 'https://www.facebook.com/abdelrahman.ebrahim.18659/',
  },
  year: new Date().getFullYear(),
};

/** Testimonials from the original landing page. */
export const reviews = [
  { name: 'محمد عبدالله', text: 'لقد حجزت موعدا مع صالون الحلاقة وكان هادئ وسريع.', rating: 5, image: '/images/review-1.webp' },
  { name: 'مي إبراهيم', text: 'الدكتور شاطر جدًا وشرحلي حالتي بكل بساطة. الحجز كان سهل وسريع.', rating: 4.5, image: '/images/review-2.webp' },
  { name: 'محمد إبراهيم', text: 'الجيم منظم والمدربين محترفين. قدرت أبدأ في المواعيد المتفق عليها.', rating: 5, image: '/images/review-3.webp' },
];

/** Images bundled with the app that admins can pick for a provider (until uploads are added). */
export const providerImages = [
  'braber.webp', 'braber_two.webp', 'braber_three.webp', 'braber_four.webp', 'braber_five.webp',
  'young-man-barbershop-trimming-hair.webp',
  'doctor_one.webp', 'doctor_two.webp', 'doctor_three.webp', 'doctor_four.webp', 'doctor_five.webp', 'clinc.webp',
  'gym.webp', 'gym_one.webp', 'gym_two.webp', 'gym_three.webp', 'gym_four.webp', 'gym_five.webp',
].map((f) => `/images/${f}`);
