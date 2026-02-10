import { z } from 'zod';

/**
 * Shared Zod schemas for authentication forms.
 * Used with React Hook Form + @hookform/resolvers/zod.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Please enter your full name.')
      .max(255, 'Name must be 255 characters or fewer.'),
    email: z
      .string()
      .min(1, 'Please enter your email address.')
      .email('Please enter a valid email address.'),
    orgName: z
      .string()
      .min(1, 'Please enter your organization name.')
      .max(255, 'Organization name must be 255 characters or fewer.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please re-enter your password.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
