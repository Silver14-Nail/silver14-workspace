import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z.string().min(1, 'contact.errors.fullNameRequired'),
  email: z
    .string()
    .min(1, 'contact.errors.emailRequired')
    .email('contact.errors.emailInvalid'),
  phone: z.string().min(1, 'contact.errors.phoneRequired'),
});

export const shippingSchema = z.object({
  firstName: z.string().min(1, 'shipping.errors.firstNameRequired'),
  lastName: z.string().min(1, 'shipping.errors.lastNameRequired'),
  address: z.string().min(1, 'shipping.errors.addressRequired'),
  apartment: z.string(),
  city: z.string().min(1, 'shipping.errors.cityRequired'),
  postalCode: z.string(),
  country: z.string().min(1),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
