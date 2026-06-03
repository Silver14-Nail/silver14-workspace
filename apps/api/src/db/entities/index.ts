import { UserEntity } from './auths/user.entity';
import { AddressEntity } from './auths/address.entity';
import { UserAuthIdentityEntity } from './auths/user-auth-identities.entity';
import { AuthProviderEntity } from './auths/auth-provider.entity';
import { UserSessionEntity } from './auths/user-session.entity';
import { PasswordResetEntity } from './auths/password-resets.entity';
import { EmailVerificationEntity } from './auths/email-verifications.entity';
import { OAuthStateTokenEntity } from './auths/oauth-state-tokens.entity';

import { ProductEntity } from './products/product.entity';
import { ProductImageEntity } from './products/product-image.entity';
import { ProductShapePricingEntity } from './products/product-shape-pricing.entity';
import { ProductVariantEntity } from './products/product-variants.entity';
import { NailShapeEntity } from './products/nail-shape.entity';
import { NailSizeEntity } from './products/nail-size.entity';

import { GuestCheckoutEntity } from './checkouts/guest-checkout.entity';
import { CartEntity } from './checkouts/cart.entity';
import { CartItemEntity } from './checkouts/cart-item.entity';
import { CheckoutSessionEntity } from './checkouts/checkout-session.entity';
import { ShippingMethodEntity } from './checkouts/shipping-method.entity';

import { CouponEntity } from './coupons/coupon.entity';
import { CouponRestrictionEntity } from './coupons/coupon-restriction.entity';
import { CouponUsageEntity } from './coupons/coupon-usage.entity';
import { CouponUserWhitelistEntity } from './coupons/coupon-user-whitelist.entity';

import { OrderEntity } from './orders/order.entity';
import { OrderItemEntity } from './orders/order-item.entity';
import { CustomSizeRequestEntity } from './orders/custom-size-request.entity';

import { PaymentEntity } from './payments/payment.entity';
import { PaypalDetailEntity } from './payments/paypal-detail.entity';
import { CardDetailEntity } from './payments/card-detail.entity';
import { AirwallexDetailEntity } from './payments/airwallex-detail.entity';
import { TwocheckoutDetailEntity } from './payments/twocheckout-detail.entity';

import { MarketingCampaignEntity } from './marketing/marketing-campaign.entity';
import { MarketingCampaignTranslationEntity } from './marketing/marketing-campaign-translation.entity';

import { NewsletterSubscriberEntity } from './wholesales/newsletter-subscribers.entity';
import { WholesaleEnquiryEntity } from './wholesales/wholesale-enquiry.entity';
import { WholesaleAccountEntity } from './wholesales/wholesale-account.entity';
import { WholesaleTierEntity } from './wholesales/wholesale-tier.entity';
import { WholesaleProductPricingEntity } from './wholesales/wholesale-product-pricing.entity';
import { WholesaleOrderEntity } from './wholesales/wholesale-order.entity';

export {
  UserEntity,
  AddressEntity,
  UserAuthIdentityEntity,
  AuthProviderEntity,
  UserSessionEntity,
  PasswordResetEntity,
  EmailVerificationEntity,
  OAuthStateTokenEntity,
  ProductEntity,
  ProductImageEntity,
  ProductShapePricingEntity,
  ProductVariantEntity,
  NailShapeEntity,
  NailSizeEntity,
  GuestCheckoutEntity,
  CartEntity,
  CartItemEntity,
  CheckoutSessionEntity,
  ShippingMethodEntity,
  CouponEntity,
  CouponRestrictionEntity,
  CouponUsageEntity,
  CouponUserWhitelistEntity,
  OrderEntity,
  OrderItemEntity,
  CustomSizeRequestEntity,
  PaymentEntity,
  PaypalDetailEntity,
  CardDetailEntity,
  AirwallexDetailEntity,
  TwocheckoutDetailEntity,
  NewsletterSubscriberEntity,
  WholesaleEnquiryEntity,
  WholesaleAccountEntity,
  WholesaleTierEntity,
  WholesaleProductPricingEntity,
  WholesaleOrderEntity,
  MarketingCampaignEntity,
  MarketingCampaignTranslationEntity,
};

export const AUTH_ENTITIES = [
  UserEntity,
  AddressEntity,
  UserAuthIdentityEntity,
  AuthProviderEntity,
  UserSessionEntity,
  PasswordResetEntity,
  EmailVerificationEntity,
  OAuthStateTokenEntity,
];

export const PRODUCT_ENTITIES = [
  ProductEntity,
  ProductImageEntity,
  ProductShapePricingEntity,
  ProductVariantEntity,
  NailShapeEntity,
  NailSizeEntity,
];

export const CHECKOUT_ENTITIES = [
  GuestCheckoutEntity,
  CartEntity,
  CartItemEntity,
  CheckoutSessionEntity,
  ShippingMethodEntity,
];

export const ORDER_ENTITIES = [OrderEntity, OrderItemEntity, CustomSizeRequestEntity];

export const COUPON_ENTITIES = [
  CouponEntity,
  CouponRestrictionEntity,
  CouponUsageEntity,
  CouponUserWhitelistEntity,
];

export const WHOLESALE_ENTITIES = [
  NewsletterSubscriberEntity,
  WholesaleEnquiryEntity,
  WholesaleAccountEntity,
  WholesaleTierEntity,
  WholesaleProductPricingEntity,
  WholesaleOrderEntity,
];

export const PAYMENT_ENTITIES = [
  PaymentEntity,
  PaypalDetailEntity,
  CardDetailEntity,
  AirwallexDetailEntity,
  TwocheckoutDetailEntity,
];

export const MARKETING_ENTITIES = [MarketingCampaignEntity, MarketingCampaignTranslationEntity];

export const ENTITIES = [
  ...AUTH_ENTITIES,
  ...PRODUCT_ENTITIES,
  ...CHECKOUT_ENTITIES,
  ...ORDER_ENTITIES,
  ...COUPON_ENTITIES,
  ...WHOLESALE_ENTITIES,
  ...PAYMENT_ENTITIES,
  ...MARKETING_ENTITIES,
];
