import { z } from 'zod';

export const emailSchema = z.string().trim().email();

export const checkoutContactSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  country: z.string().trim().min(2),
});

export const wholesaleInquirySchema = checkoutContactSchema.extend({
  businessName: z.string().trim().optional(),
  expectedQuantity: z.coerce.number().int().positive(),
  message: z.string().trim().min(10),
});

export type CheckoutContactInput = z.infer<typeof checkoutContactSchema>;
export type WholesaleInquiryInput = z.infer<typeof wholesaleInquirySchema>;
