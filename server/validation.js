import { z } from 'zod';

export const UrlFormSchema = z.object({
  url: z.string(),
  email: z
    .string()
    .email('Please enter a valid email')
    .trim()
    .optional()
});

export const searchEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .optional()
});