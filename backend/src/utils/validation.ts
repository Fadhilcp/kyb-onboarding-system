import { z } from 'zod';

export const createApplicationSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required'),
  registrationNumber: z.string().trim().min(1, 'Registration number is required'),
  registrationExpiry: z.coerce.date(),
  ownerName: z.string().trim().min(1, 'Owner name is required'),
  contactEmail: z.string().trim().email('Invalid contactEmail format'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
