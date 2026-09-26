import { z } from 'zod';
import { emailField, passwordField, nameField, phoneField } from './common.js';

export const registerBody = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
});

export const loginBody = z.object({
  email: emailField,
  password: z.string({ required_error: 'كلمة المرور مطلوبة' }).min(1, 'كلمة المرور مطلوبة'),
});

export const updateProfileBody = z
  .object({ name: nameField, phone: phoneField })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');

export const changePasswordBody = z.object({
  currentPassword: z.string({ required_error: 'كلمة المرور الحالية مطلوبة' }).min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordField,
});
