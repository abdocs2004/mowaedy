import { z } from 'zod';
import { emailField, nameField, pageQuery, boolQuery } from './common.js';

export const contactBody = z.object({
  name: nameField,
  email: emailField,
  subject: z.string().trim().max(120, 'الموضوع طويل جداً').optional(),
  message: z
    .string({ required_error: 'الرسالة مطلوبة' })
    .trim()
    .min(5, 'الرسالة قصيرة جداً')
    .max(1000, 'الرسالة يجب ألا تزيد عن 1000 حرف'),
});

export const listMessagesQuery = z.object({ isRead: boolQuery.optional(), ...pageQuery });
export const readBody = z.object({ isRead: z.boolean() });
