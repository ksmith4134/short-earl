import { z } from 'zod';

export const UrlFormSchema = z.object({
  url: z.string(),
  email: z
    .string()
    .email('Please enter a valid email')
    .trim()
    .optional()
});

export const userEmailSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .trim()
    .optional()
});