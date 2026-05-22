# Silver14 Nail — Project Spec

> **Mục đích:** File này chứa toàn bộ cấu trúc dự án để Claude AI đọc nhanh mà không cần scan lại codebase.
> **Cập nhật lần cuối:** 2026-05-22

---

## 1. Tổng quan

Nx monorepo cho nền tảng thương mại điện tử nail art, nhắm thị trường EU. Hỗ trợ B2C (storefront) và B2B (wholesale).

| Thông tin       | Giá trị                            |
| --------------- | ---------------------------------- |
| Package manager | pnpm                               |
| Monorepo tool   | Nx                                 |
| Language        | TypeScript (strict mode OFF)       |
| Formatter       | Prettier (single quote, 100 chars) |
| Linter          | ESLint + Nx module boundary rules  |
| DB              | MySQL via TypeORM (migrations only)|
| Auth            | JWT access + refresh token + TOTP  |
| Storage         | Cloudflare R2                      |
| Payments        | Stripe + PayPal                    |

---

## 2. Apps

| App          | Framework | Path              | Port |
| ------------ | --------- | ----------------- | ---- |
| `storefront` | Next.js   | `apps/storefront` | 4200 |
| `admin`      | Next.js   | `apps/admin`      | 4201 |
| `api`        | NestJS    | `apps/api`        | 3000 |

---

## 3. Shared Libraries (`libs/`)

| Library        | Path                    | Purpose                                        |
| -------------- | ----------------------- | ---------------------------------------------- |
| `ui`           | `libs/ui/src/lib/ui/`   | Shadcn-style components (Radix UI)             |
| `types`        | `libs/types/src/lib/`   | Shared TS interfaces (Order, Product)          |
| `validators`   | `libs/validators/src/`  | Zod schemas for product, order, checkout       |
| `api-client`   | `libs/api-client/src/`  | Typed fetch wrapper                            |
| `config`       | `libs/config/src/`      | Shared env config with Joi validation schema   |

### libs/ui — Component List
`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`

---

## 4. API — NestJS (`apps/api`)

### Cấu trúc chính
```
apps/api/src/
├── main.ts
├── app/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── admin-api/          ← Protected admin endpoints (/api/admin-api)
│   ├── client-api/         ← Customer-facing endpoints (/api/user-api)
│   ├── database/           ← TypeORM module + DataSource
│   └── health/
├── common/
│   ├── dtos/               ← Response DTOs (grouped by domain)
│   ├── entities/           ← Abstract base entities
│   ├── enums/
│   ├── errors/
│   ├── filters/
│   ├── interceptors/
│   └── utils/
├── config/
│   ├── configuration.ts
│   ├── stripe.config.ts
│   └── paypal.config.ts
├── db/
│   ├── ormconfig.ts
│   ├── entities/           ← TypeORM entities (grouped by domain)
│   ├── migrations/         ← 1779418732673-create-tables.ts
│   ├── seed.ts
│   └── truncate.ts
└── shared/
    ├── auth/               ← JWT service, token service, TOTP, guards
    ├── payments/           ← Stripe + PayPal services
    ├── currency/           ← Currency service
    └── r2/                 ← Cloudflare R2 service
```

### Admin API Modules (`admin-api/`)
| Module       | Files                                                                 |
| ------------ | --------------------------------------------------------------------- |
| `auth`       | auth.module, auth.controller, dto: admin-login, admin-refresh-token, update-user, user-list-query |
| `checkouts`  | checkouts.module/controller/service, dto: cart-list-query, checkout-session-list-query, create/update-shipping-method |
| `collections`| collections.module/controller/service, dto: assign-products, collection-list-query, create/update-collection |
| `coupons`    | coupons.module/controller/service, dto: add-restriction, add-whitelist-user, coupon-list-query, create/update-coupon |
| `orders`     | orders.module/controller/service, dto: cancel-order, order-list-query, update-order-status, update-order, update-payment-status, update-shipping |
| `payments`   | payments.module/controller/service, dto: payment-list-query |
| `products`   | products.module/controller/service, dto: add-image, create-nail-shape, create-nail-size, create-product, create-variant, get-presigned-url, product-list-query, reorder-images, update-nail-shape, update-nail-size, update-product, update-variant |
| `users`      | users.module/controller/service, dto: update-user, user-list-query |
| `wholesales` | wholesales.module/controller/service, dto: account-list-query, approve-enquiry, enquiry-list-query, newsletter-list-query, update-newsletter-subscriber, update-wholesale-account, update-wholesale-enquiry, update-wholesale-tier |

### Client API Modules (`client-api/`)
| Module        | Files                                                                 |
| ------------- | --------------------------------------------------------------------- |
| `auth`        | auth.module/controller/service, guard: client-jwt-auth, dto: forgot-password, login-customer, register-customer, reset-password |
| `cart`        | cart.module/controller/service, dto: add-cart-item, merge-cart, update-cart-item |
| `checkout`    | checkout.module/controller/service, dto: apply-coupon, create-checkout-session, update-contact, update-shipping |
| `collections` | client-collections.module/controller/service, dto: collection-query |
| `coupons`     | client-coupons.module/controller/service, dto: validate-coupon |
| `currency`    | currency.module/controller |
| `orders`      | orders.module/controller/service, dto: my-orders-query, track-order-query |
| `payments`    | payments.module/controller/service, dto: capture-paypal-order, create-paypal-order, initiate-stripe-payment |
| `products`    | products.module/controller/service, dto: product-query |
| `user`        | user.module/controller/service, dto: save-address, update-profile |
| `webhooks`    | webhooks.module/controller/service |
| `wholesales`  | wholesales.module/controller/service, dto: submit-enquiry, subscribe-newsletter, unsubscribe-newsletter, wholesale-orders-query |

### Shared Auth (`shared/auth/`)
- `auth.module`, `auth.controller`, `auth.service`, `auth.interface`, `auth.types`
- `token.service`, `totp.service`, `mock-users`
- Decorators: `current-user`, `maybe-current-user`
- Guards: `jwt-auth.guard`
- DTOs: `login`, `register-customer`, `refresh-token`, `enable-two-factor`, `verify-two-factor`

### Database Entities — 36+ entities
| Domain        | Entities                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------- |
| Auth (8)      | User, UserSession, UserAuthIdentities, AuthProvider, Address, EmailVerifications, OAuthStateTokens, PasswordResets |
| Checkout (5)  | Cart, CartItem, CheckoutSession, GuestCheckout, ShippingMethod                              |
| Coupons (4)   | Coupon, CouponRestriction, CouponUsage, CouponUserWhitelist                                 |
| Orders (3)    | Order, OrderItem, CustomSizeRequest                                                          |
| Payments (3)  | Payment, CardDetail, PayPalDetail                                                            |
| Products (7)  | Product, ProductVariants, ProductImage, NailSize, NailShape, ProductShapePricing, Collection |
| Wholesale (6) | WholesaleAccount, WholesaleEnquiry, NewsletterSubscribers, WholesaleOrder, WholesaleTier, WholesaleProductPricing |

---

## 5. Storefront — Next.js (`apps/storefront`)

### App Router Structure
```
apps/storefront/src/app/
├── layout.tsx
├── error.tsx / global-error.tsx / not-found.tsx
├── robots.ts / sitemap.ts
└── [lng]/
    ├── layout.tsx / page.tsx / error.tsx / not-found.tsx
    ├── account/
    │   ├── layout.tsx / page.tsx / error.tsx / loading.tsx
    │   ├── forgot-password/page.tsx
    │   ├── reset-password/page.tsx
    │   └── orders/
    │       ├── page.tsx / error.tsx / loading.tsx
    │       └── [orderId]/page.tsx
    ├── cart/
    │   ├── layout.tsx / page.tsx / error.tsx / loading.tsx / types.ts
    │   ├── utils/index.ts
    │   └── components/  CartHeader, CartItemList, DiscountInput, EmptyCart, FreeShippingBanner, OrderSummary
    ├── checkout/
    │   ├── layout.tsx / page.tsx / error.tsx / loading.tsx
    │   ├── types.ts / schemas.ts / constants.ts
    │   ├── hooks/useCheckout.ts
    │   └── components/
    │       ├── StepIndicator, CheckoutSidebar
    │       ├── steps/  ContactStep, ShippingStep, PaymentStep, ConfirmationStep
    │       └── ui/  Buttons, InputField
    ├── products/
    │   ├── layout.tsx / page.tsx / error.tsx / loading.tsx / types.ts / constants.ts
    │   ├── hooks/useProductFilters.ts
    │   ├── components/  ProductsHeader, ProductsFilters, ProductsGrid, SearchInput, SortDropdown
    │   └── [slug]/
    │       ├── layout.tsx / page.tsx / types.ts
    │       ├── hooks/useProductDetail.ts
    │       └── components/  Breadcrumb, ImageGallery, ProductInfo, ProductAccordion, RelatedProducts, ProductNotFound, TrustBadges, MobileCartBar
    ├── collections/
    │   ├── layout.tsx / page.tsx / error.tsx / loading.tsx
    │   └── [slug]/  layout.tsx / page.tsx / CollectionSortBar / CollectionProductPrice
    ├── supplies/
    │   ├── page.tsx
    │   ├── components/  SuppliesHeader, SuppliesGrid
    │   └── [slug]/
    │       ├── page.tsx
    │       ├── components/  ImageGallery, SupplyNotFound
    │       └── hooks/useSupplyDetail.ts
    ├── order/tracking/
    │   ├── page.tsx / types.ts / constants.ts
    │   ├── hooks/useOrderTracking.ts
    │   └── components/  TrackForm, OrderResult, OrderSummary, StatusTimeLine, ShippingInfo, ui/(InputField, StatusBadge)
    ├── wholesales/
    │   ├── page.tsx / error.tsx / loading.tsx
    │   └── account/page.tsx
    └── [info pages]/  about-us, contact, faq, size-guide, shipping-policy, returns
```

### Storefront Source Structure
```
apps/storefront/src/
├── components/
│   ├── layout/        Navbar, Footer
│   ├── shared/        LinkBase, ProductCard, CartDrawer, CartPreviewDialog, AIChat, HeaderPreferencesDropdown
│   ├── checkout/      StripePaymentForm
│   ├── error-boundary/ErrorBoundary
│   └── figma/         ImageWithFallback
├── features/
│   ├── auth/          customer-auth.api, customer-auth.storage, customer-auth.types
│   ├── cart/          cart.api, cart.storage, cart.types, cart.hooks, cart.utils
│   ├── checkout/      checkout.api, checkout.storage, checkout.types, checkout.utils
│   ├── collections/   collections.api
│   ├── coupons/       coupons.api
│   ├── orders/        orders.api, orders.types, hooks/(useCustomerOrders, useCustomerOrderDetail)
│   └── wholesale/     wholesale.api, wholesale.types, hooks/(useWholesaleAccount, useWholesaleEnquiry, useWholesaleTiers)
├── hooks/             useCustomerAuth, useCart, useCurrency, useProduct, useProducts, useWishlist
├── store/
│   ├── StoreProvider.tsx / hooks.ts / index.ts / storage.ts
│   └── slices/        auth.slice, cart.slice, currency.slice, wishlist.slice
├── context/           orders.storage.ts
├── lib/               api-error, formatPrice, logger, pricing, product.adapter, products.api, seo
├── config/            commerce.config.ts
├── services/          currency.service.ts
├── types/             product.ts
├── i18n.config.ts
├── proxy.ts
└── MOCK_DATAS/        products.ts, supplies.ts
```

---

## 6. Admin — Next.js (`apps/admin`)

### App Router Structure
```
apps/admin/src/app/
├── layout.tsx
├── (auth)/login/page.tsx
├── (admin)/
│   ├── layout.tsx
│   ├── page.tsx                  ← Dashboard
│   └── admin/
│       ├── analytics/page.tsx
│       ├── products/             page, types, actions + _components/(ProductsClient, products tabs, nail-shapes, nail-sizes)
│       ├── collections/          page, types, actions + _components/(CollectionsClient, CollectionFormDrawer, CollectionDetailDrawer)
│       ├── orders/               page, types, actions + _components/(OrdersClient, OrderDrawer)
│       ├── coupons/              page, types, actions + _components/(CouponsClient, CouponFormDrawer, CouponDetailDrawer)
│       ├── users/                page, actions + _components/(UsersClient, UserDrawer)
│       ├── wholesales/           page, types, actions + _components/(WholesalesClient, AccountDrawer, EnquiryDrawer, TierFormDrawer)
│       ├── checkouts/page.tsx
│       ├── payments/page.tsx
│       ├── inventory/page.tsx
│       ├── newsletters/page.tsx
│       ├── settings/page.tsx
│       └── shared/Pagination.tsx
└── api/auth/
    ├── login/route.ts
    ├── logout/route.ts
    ├── me/route.ts
    └── refresh/route.ts
```

### Admin Source Structure
```
apps/admin/src/
├── components/
│   ├── AppInitializer.tsx
│   ├── ReduxProvider.tsx
│   └── layouts/AdminShell.tsx
├── context/AdminThemeContext.tsx
├── hooks/useAuth.ts
├── middleware.ts
├── services/
│   ├── api-client.ts
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── products.service.ts
│   ├── collections.service.ts
│   ├── coupons.service.ts
│   ├── orders.service.ts
│   └── wholesales.service.ts
├── store/
│   ├── hooks.ts / index.ts
│   └── slices/auth.slice.ts
├── types/auth.types.ts
└── MOCK_DATAS/mockData.ts
```

---

## 7. Environment Variables

### `apps/api/.env`
```
PORT, ALLOWED_HOSTS, ENABLE_SWAGGER
SECRET_KEY, TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES
DATABASE_TYPE, DATABASE_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, MYSQL_PORT
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE, PAYPAL_WEBHOOK_ID
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
```

### `apps/admin/.env.local`
```
API_URL
```

### `apps/storefront/.env.local`
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_PAYPAL_CLIENT_ID
```

---

## 8. Root Config Files

```
/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── nx.json
├── tsconfig.base.json
├── tsconfig.json
├── eslint.config.mjs
├── jest.config.ts
├── jest.preset.js
├── ecosystem.config.js        ← PM2 config
├── .prettierrc
├── .editorconfig
└── .husky/
```

### Per-app configs
| App          | Files                                                   |
| ------------ | ------------------------------------------------------- |
| `api`        | `webpack.config.js`                                     |
| `storefront` | `next.config.js`, `tailwind.config.js`, `postcss.config.js` |
| `admin`      | `next.config.js`, `tailwind.config.js`, `postcss.config.js` |

---

## 9. Commands

```bash
# Dev
pnpm run dev:storefront          # port 4200
pnpm run dev:admin               # port 4201
pnpm run dev:api                 # port 3000

# Build
nx build storefront
nx build admin
nx build api
nx run-many -t build

# Test & Lint
nx affected --target=lint,test   # run before committing

# Database (from apps/api/)
pnpm run db:generate
pnpm run db:migrate
pnpm run db:revert
pnpm run db:drop                 # DESTRUCTIVE
```

---

## 10. API Routes Summary

| Prefix            | Auth Required | Description           |
| ----------------- | ------------- | --------------------- |
| `/api/admin-api/` | Admin JWT     | All admin operations  |
| `/api/user-api/`  | Optional/User | Customer-facing API   |
| `/api/docs`       | -             | Swagger UI            |
| `/api/health`     | -             | Health check          |

---

## 11. Auth Flow

- **Admin:** Login via `/api/admin-api/auth/login` → JWT access token + refresh token (cookie)
- **Customer:** Register/Login via `/api/user-api/auth/*` → JWT + refresh token
- **TOTP:** Two-factor auth available for admin accounts
- **Roles:** `customer` | `admin` | `wholesale`
- **Guard:** `JwtAuthGuard` (shared), `ClientJwtAuthGuard` (client-specific)
- **Decorators:** `@CurrentUser()`, `@MaybeCurrentUser()`

---

## 12. Common Patterns

### Adding a new API module
1. Create under `admin-api/` hoặc `client-api/`
2. Register trong parent module
3. Thêm Swagger decorators

### Database changes
- Tạo TypeORM migration — **KHÔNG dùng `synchronize: true`**
- `pnpm run db:generate` → `pnpm run db:migrate`

### Shared code
- Domain types → `libs/types`
- Zod validation schemas → `libs/validators`
- UI components → `libs/ui`

### Entities pattern
- Soft delete dùng `deleted_at` cho critical domains
- JSON columns cho flexible data (OAuth profiles, shipping/contact snapshots)
- Base classes: `AbstractEntity`, `SoftDeleteAbstractEntity`

---

## 13. Git Workflow

- Branch: `feat/`, `fix/`, `chore/`
- Commits: Conventional Commits (`feat(scope): message`)
- **Không** push trực tiếp vào `main`
- Husky pre-commit hooks đang active
- Chạy `nx affected --target=lint,test` trước khi commit
