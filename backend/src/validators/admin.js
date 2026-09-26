import { z } from 'zod';
import { ROLE_VALUES } from '../config/constants.js';
import { emailField, nameField, phoneField, passwordField, pageQuery, boolQuery } from './common.js';

export const adminListUsersQuery = z.object({
  q: z.string().trim().max(60).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  isActive: boolQuery.optional(),
  ...pageQuery,
});

export const adminCreateUserBody = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField.optional(),
  password: passwordField,
  role: z.enum(['user', 'admin']).default('user'),
});

export const adminUpdateUserBody = z
  .object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    role: z.enum(ROLE_VALUES),
    isActive: z.boolean(),
    password: passwordField,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'لا توجد بيانات للتحديث');
