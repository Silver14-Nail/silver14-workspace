// Form-level types for the checkout UI (not persisted until submitted to API)

export type ContactDetails = {
  email: string;
  phone: string;
  fullName: string;
};

export type ShippingDetails = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
};

export type PaymentMethod = 'card';
