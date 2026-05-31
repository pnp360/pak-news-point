import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('درست ای میل درج کریں'),
  password: z.string().min(6, 'پاس ورڈ کم از کم 6 حروف ہونا چاہیے'),
});

export const articleSchema = z.object({
  title: z.string().min(3, 'عنوان کم از کم 3 حروف ہونا چاہیے').max(500),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().min(10, 'مواد کم از کم 10 حروف ہونا چاہیے'),
  categoryId: z.string().min(1, 'زمرہ منتخب کریں'),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  scheduledAt: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'نام کم از کم 2 حروف'),
  nameUrdu: z.string().min(2, 'اردو نام کم از کم 2 حروف'),
  description: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const tagSchema = z.object({
  name: z.string().min(2, 'نام کم از کم 2 حروف'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'نام کم از کم 2 حروف'),
  email: z.string().email('درست ای میل درج کریں'),
  subject: z.string().min(3, 'موضوع کم از کم 3 حروف'),
  message: z.string().min(10, 'پیغام کم از کم 10 حروف'),
});

export const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const userSchema = z.object({
  name: z.string().min(2).optional().nullable(),
  email: z.string().email(),
  password: z.string().min(6).optional().nullable(),
  role: z.enum(['ADMIN', 'EDITOR', 'AUTHOR']).default('AUTHOR'),
});
