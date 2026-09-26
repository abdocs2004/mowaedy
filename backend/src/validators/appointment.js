import { z } from 'zod';
import { objectId, nameField, phoneField, dateField, pageQuery } from './common.js';
import { STATUS_VALUES } from '../config/constants.js';

export const createAppointmentBody = z.object({
  providerId: objectId('مقدم الخدمة مطلوب'),
  serviceId: objectId('الخدمة مطلوبة'),
  startAt: z
    .string({ required_error: 'موعد الحجز مطلوب' })
    .refine((s) => !Number.isNaN(Date.parse(s)), 'موعد الحجز غير صالح'),
  // Defaults to the account's name/phone when omitted.
  customerName: nameField.optional(),
  customerPhone: phoneField.optional(),
  notes: z.string().trim().max(500, 'الملاحظات طويلة جداً').optional(),
});

export const cancelBody = z.object({ reason: z.string().trim().max(300).optional() }).default({});

export const statusBody = z.object({
  status: z.enum(STATUS_VALUES, { errorMap: () => ({ message: 'حالة الموعد غير صالحة' }) }),
  reason: z.string().trim().max(300).optional(),
});

export const myAppointmentsQuery = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  scope: z.enum(['upcoming', 'past']).optional(),
  ...pageQuery,
});

export const manageAppointmentsQuery = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  q: z.string().trim().max(60).optional(), // customer name / phone / service
  date: dateField.optional(),
  from: dateField.optional(),
  to: dateField.optional(),
  provider: objectId().optional(), // admin only
  ...pageQuery,
});
