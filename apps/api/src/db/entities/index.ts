import { User } from './auths/user.entity';
import { Address } from './auths/address.entity';
import { UserAuthIdentity } from './auths/user-auth-identities.entity';
import { AuthProvider } from './auths/auth-provider.entity';
import { UserSession } from './auths/user-session.entity';
import { PasswordReset } from './auths/password-resets.entity';
import { EmailVerification } from './auths/email-verifications.entity';
import { OAuthStateToken } from './auths/oauth-state-tokens.entity';

import { Product } from './products/product.entity';
import { ProductImage } from './products/product-image.entity';
import { ProductShapePricing } from './products/product-shape-pricing.entity';
import { ProductVariant } from './products/product-variants.entity';
import { NailShape } from './products/nail-shape.entity';
import { NailSize } from './products/nail-size.entity';

import { GuestCheckout } from './checkouts/guest-checkout.entity';
import { Cart } from './checkouts/cart.entity';
import { CartItem } from './checkouts/cart-item.entity';
import { CheckoutSession } from './checkouts/checkout-session.entity';
import { ShippingMethod } from './checkouts/shipping-method.entity';

import { Coupon } from './coupons/coupon.entity';
import { CouponRestriction } from './coupons/coupon-restriction.entity';
import { CouponUsage } from './coupons/coupon-usage.entity';
import { CouponUserWhitelist } from './coupons/coupon-user-whitelist.entity';

import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { CustomSizeRequest } from './orders/custom-size-request.entity';

import { Payment } from './payments/payment.entity';
import { PaypalDetail } from './payments/paypal-detail.entity';
import { CardDetail } from './payments/card-detail.entity';

import { NewsletterSubscriber } from './wholesales/newsletter-subscribers.entity';
import { WholesaleEnquiry } from './wholesales/wholesale-enquiry.entity';
import { WholesaleAccount } from './wholesales/wholesale-account.entity';
import { WholesaleTier } from './wholesales/wholesale-tier.entity';
import { WholesaleProductPricing } from './wholesales/wholesale-product-pricing.entity';
import { WholesaleOrder } from './wholesales/wholesale-order.entity';

export {
  User,
  Address,
  UserAuthIdentity,
  AuthProvider,
  UserSession,
  PasswordReset,
  EmailVerification,
  OAuthStateToken,
  Product,
  ProductImage,
  ProductShapePricing,
  ProductVariant,
  NailShape,
  NailSize,
  GuestCheckout,
  Cart,
  CartItem,
  CheckoutSession,
  ShippingMethod,
  Coupon,
  CouponRestriction,
  CouponUsage,
  CouponUserWhitelist,
  Order,
  OrderItem,
  CustomSizeRequest,
  Payment,
  PaypalDetail,
  CardDetail,
  NewsletterSubscriber,
  WholesaleEnquiry,
  WholesaleAccount,
  WholesaleTier,
  WholesaleProductPricing,
  WholesaleOrder,
};

export const AUTH_ENTITIES = [
  User,
  Address,
  UserAuthIdentity,
  AuthProvider,
  UserSession,
  PasswordReset,
  EmailVerification,
  OAuthStateToken,
];

export const PRODUCT_ENTITIES = [
  Product,
  ProductImage,
  ProductShapePricing,
  ProductVariant,
  NailShape,
  NailSize,
];

export const CHECKOUT_ENTITIES = [GuestCheckout, Cart, CartItem, CheckoutSession, ShippingMethod];

export const ORDER_ENTITES = [Order, OrderItem, CustomSizeRequest];

export const COUPON_ENTITIES = [Coupon, CouponRestriction, CouponUsage, CouponUserWhitelist];

export const WHOLE_SALES_ENTITIES = [
  NewsletterSubscriber,
  WholesaleEnquiry,
  WholesaleAccount,
  WholesaleTier,
  WholesaleProductPricing,
  WholesaleOrder,
];

export const PAYMENT_ENTITIES = [Payment, PaypalDetail, CardDetail];

export const ENTITIES = [
  User,
  Address,
  UserAuthIdentity,
  AuthProvider,
  UserSession,
  PasswordReset,
  EmailVerification,
  OAuthStateToken,
  Product,
  ProductImage,
  ProductShapePricing,
  ProductVariant,
  NailShape,
  NailSize,
  GuestCheckout,
  Cart,
  CartItem,
  CheckoutSession,
  ShippingMethod,
  Coupon,
  CouponRestriction,
  CouponUsage,
  CouponUserWhitelist,
  Order,
  OrderItem,
  CustomSizeRequest,
  Payment,
  PaypalDetail,
  CardDetail,
  NewsletterSubscriber,
  WholesaleEnquiry,
  WholesaleAccount,
  WholesaleTier,
  WholesaleProductPricing,
  WholesaleOrder,
];
