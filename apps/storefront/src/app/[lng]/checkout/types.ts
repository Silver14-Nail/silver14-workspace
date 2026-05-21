import type { PaymentMethod } from '@/features/checkout/checkout.utils';

export type Step = 'contact' | 'shipping' | 'payment' | 'confirmation';

export type { PaymentMethod };
