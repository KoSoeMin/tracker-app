import { z } from 'zod';
import { PAYMENT_METHODS, CURRENCIES } from '../constants';

export const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileSchema = z.object({
  full_name: z.string().max(100).optional(),
  currency: z.enum(CURRENCIES).default('MMK'),
});

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid('Invalid category'),
  payment_method: z.enum(PAYMENT_METHODS).default('Cash'),
  description: z.string().max(500).optional(),
  receipt_url: z.string().url().optional(),
  transaction_date: z.string().datetime(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['income', 'expense']),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

export const loginSchema = authSchema;
export const registerSchema = authSchema.extend({
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
