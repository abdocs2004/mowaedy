import { z } from 'zod';
import { isValidDateStr } from '../utils/time.js';

const req = (msg) => ({ required_error: msg, invalid_type_error: msg });

export const objectId = (msg = 'معرّف غير صالح') => z.string(req(msg)).regex(/^[0-9a-fA-F]{24}$/, msg);

export const idParams = z.object({ id: objectId() });

export const emailField = z
  .string(req('البريد الإلكتروني مطلوب'))
  .trim()
  .toLowerCase()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('البريد الإلكتروني غير صالح');

export const passwordField = z
  .string(req('كلمة المرور مطلوبة'))
  .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
  .max(72, 'كلمة المرور طويلة جداً')
  .regex(/[A-Za-z\u0600-\u06FF]/, 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل')
  .regex(/\d/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');

export const nameField = z
  .string(req('الاسم مطلوب'))
  .trim()
  .min(2, 'الاسم يجب ألا يقل عن حرفين')
  .max(80, 'الاسم طويل جداً');

/** Accepts local (01xxxxxxxxx) and international (+20…) numbers; spaces/dashes are stripped. */
export const phoneField = z
  .string(req('رقم الهاتف مطلوب'))
  .transform((s) => s.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+?\d{10,15}$/, 'رقم الهاتف غير صالح'));

export const optionalPhone = z
  .string()
  .transform((s) => s.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^(\+?\d{10,15})?$/, 'رقم الهاتف غير صالح'));

export const dateField = z
  .string(req('التاريخ مطلوب'))
  .refine(isValidDateStr, 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)');

export const timeField = z
  .string(req('الوقت مطلوب'))
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت غير صحيحة (HH:mm)');

export const pageQuery = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

export const boolQuery = z.enum(['true', 'false']).transform((v) => v === 'true');
