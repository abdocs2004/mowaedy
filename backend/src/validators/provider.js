import { z } from 'zod';
import { objectId, emailField, passwordField, nameField, phoneField, optionalPhone, timeField, dateField, pageQuery, boolQuery } from './common.js';

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

const breakSchema = z
  .object({ start: timeField, end: timeField })
  .refine((b) => toMin(b.start) < toMin(b.end), 'بداية الاستراحة يجب أن تسبق نهايتها');

const workingDaySchema = z
  .object({
    day: z.number().int().min(0).max(6),
    isOpen: z.boolean(),
    start: timeField.default('10:00'),
    end: timeField.default('18:00'),
    breaks: z.array(breakSchema).max(3).default([]),
  })
  .refine((d) => !d.isOpen || toMin(d.start) < toMin(d.end), { message: 'وقت بداية العمل يجب أن يسبق وقت النهاية', path: ['start'] });

export const workingHoursSchema = z
  .array(workingDaySchema)
  .max(7)
  .refine((arr) => new Set(arr.map((d) => d.day)).size === arr.length, 'لا يمكن تكرار نفس اليوم');

const categoryDataSchema = z
  .object({
    specialty: z.string().trim().max(100).optional(), // clinic
    experienceYears: z.number().int().min(0).max(60).optional(), // barber / gym coach
    specialties: z.array(z.string().trim().max(60)).max(10).optional(), // gym / barber
    facilities: z.array(z.string().trim().max(60)).max(15).optional(), // gym / clinic
  })
  .strict('حقل غير مسموح في بيانات القسم');

const profileFields = {
  name: nameField,
  businessName: z.string().trim().max(100),
  description: z.string().trim().max(1500),
  image: z.string().trim().max(300),
  city: z.string().trim().max(60),
  address: z.string().trim().max(200),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  slotMinutes: z.number().int().min(5, 'أقل مدة للفترة 5 دقائق').max(240),
  minNoticeMinutes: z.number().int().min(0).max(60 * 24 * 7),
  maxAdvanceDays: z.number().int().min(1).max(365),
  autoConfirm: z.boolean(),
  workingHours: workingHoursSchema,
  categoryData: categoryDataSchema,
};

/** Provider editing own profile. */
export const updateOwnProviderBody = z
  .object(profileFields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');

/** Admin creating a provider (+ its owner account). */
export const adminCreateProviderBody = z.object({
  owner: z.object({ name: nameField, email: emailField, password: passwordField, phone: phoneField.optional() }),
  category: objectId('القسم مطلوب'),
  ...Object.fromEntries(Object.entries(profileFields).map(([k, v]) => [k, k === 'name' ? v : v.optional()])),
  isActive: z.boolean().optional(),
});

export const adminUpdateProviderBody = z
  .object({ ...profileFields, category: objectId(), isActive: z.boolean() })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');

export const listProvidersQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.string().trim().max(30).optional(), // slug
  location: z.string().trim().max(60).optional(),
  service: z.string().trim().max(60).optional(),
  sort: z.enum(['rating', 'name', 'newest']).optional(),
  ...pageQuery,
});

export const adminListProvidersQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: objectId().optional(),
  isActive: boolQuery.optional(),
  ...pageQuery,
});

export const slotsQuery = z.object({ serviceId: objectId('الخدمة مطلوبة'), date: dateField });
export const availabilityQuery = z.object({
  serviceId: objectId('الخدمة مطلوبة'),
  from: dateField.optional(),
  days: z.coerce.number().int().min(1).max(60).optional(),
});

/* ---------- services ---------- */
const serviceFields = {
  name: z.string({ required_error: 'اسم الخدمة مطلوب' }).trim().min(2, 'اسم الخدمة قصير جداً').max(100),
  description: z.string().trim().max(500),
  price: z.number({ required_error: 'السعر مطلوب', invalid_type_error: 'السعر يجب أن يكون رقماً' }).min(0, 'السعر لا يمكن أن يكون سالباً').max(1_000_000),
  durationMinutes: z.number({ required_error: 'مدة الخدمة مطلوبة', invalid_type_error: 'المدة يجب أن تكون رقماً' }).int().min(5, 'أقل مدة 5 دقائق').max(480, 'أقصى مدة 8 ساعات'),
  isActive: z.boolean(),
};

export const createServiceBody = z.object({
  name: serviceFields.name,
  description: serviceFields.description.optional(),
  price: serviceFields.price,
  durationMinutes: serviceFields.durationMinutes,
  isActive: serviceFields.isActive.optional(),
});
export const updateServiceBody = z
  .object(serviceFields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');

export const adminCreateServiceBody = createServiceBody.extend({ provider: objectId('مقدم الخدمة مطلوب') });
export const adminListServicesQuery = z.object({
  provider: objectId().optional(),
  q: z.string().trim().max(60).optional(),
  ...pageQuery,
});

/* ---------- categories ---------- */
export const categoryBody = z.object({
  slug: z.string({ required_error: 'المعرّف مطلوب' }).trim().toLowerCase().regex(/^[a-z0-9-]{2,30}$/, 'المعرّف يجب أن يكون بأحرف إنجليزية صغيرة وأرقام وشرطات'),
  nameAr: z.string({ required_error: 'اسم القسم مطلوب' }).trim().min(2).max(60),
  singularAr: z.string().trim().max(60).optional(),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().max(60).optional(),
  image: z.string().trim().max(300).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const categoryUpdateBody = categoryBody.partial().refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');
