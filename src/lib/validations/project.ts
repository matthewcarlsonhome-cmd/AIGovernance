import { z } from 'zod';

/**
 * Shared Zod schemas for project creation and management forms.
 * Used with React Hook Form + @hookform/resolvers/zod.
 */

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Government',
  'Manufacturing',
  'Retail',
  'Other',
] as const;

export const ORG_SIZES = [
  '1-50',
  '51-200',
  '201-1000',
  '1001-5000',
  '5000+',
] as const;

export const projectDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required.')
    .max(255, 'Project name must be 255 characters or fewer.'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .optional()
    .default(''),
  industry: z
    .string()
    .min(1, 'Please select an industry.'),
  orgSize: z
    .string()
    .min(1, 'Please select an organization size.'),
});

export type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>;
