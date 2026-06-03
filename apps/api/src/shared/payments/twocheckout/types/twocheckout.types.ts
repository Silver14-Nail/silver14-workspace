// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TwocheckoutAuthHeader {
  code: string;
  date: string;
  hash: string;
}

// ─── Order Creation ───────────────────────────────────────────────────────────

export interface TwocheckoutOrderItem {
  Name: string;
  Description?: string;
  Quantity: number;
  Price: {
    Amount: number;
    Type: 'CUSTOM';
  };
  Type: 'PRODUCT';
}

export interface TwocheckoutBillingDetails {
  FirstName: string;
  LastName: string;
  Email: string;
  Country: string;
  Phone?: string;
  Address1?: string;
  City?: string;
  State?: string;
  Zip?: string;
}

export interface TwocheckoutCreateOrderParams {
  currency: string;
  country: string;
  customerIp: string;
  merchantOrderRef: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  billing: TwocheckoutBillingDetails;
  returnUrl: string;
  cancelUrl: string;
  language?: string;
}

export interface TwocheckoutOrderResponse {
  RefNo: string;
  MerchantOrderRef: string;
  Status: string;
  Currency: string;
  NetPrice: number;
  PaymentDetails: {
    Type: string;
    Currency: string;
    PaymentMethod: {
      RedirectURL?: string;
      Authorize3DS?: string;
      BACK_REF?: string;
    };
  };
}

// ─── IPN (Webhook) ────────────────────────────────────────────────────────────

export interface TwocheckoutIpnPayload {
  /** 2Checkout order reference */
  REFNO: string;
  /** Our merchant order reference (= checkoutSessionId) */
  REFNOEXT: string;
  /** Order status: PURCHASE / REFUND / FRAUD / etc. */
  ORDERSTATUS: string;
  /** Payment method code */
  PAYMETHOD_CODE?: string;
  /** Payment method name */
  PAYMETHOD?: string;
  /** IPN hash for verification */
  HASH: string;
  /** IPN date */
  IPN_DATE: string;
  /** Net price */
  IPN_TOTAL_GENERAL?: string;
  /** Currency */
  CURRENCY?: string;
  [key: string]: string | string[] | undefined;
}
