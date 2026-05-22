# Silver14 Nail — API Endpoint Map

> **Mục đích:** Danh sách đầy đủ 136 HTTP endpoints của NestJS API để tra cứu nhanh.
> **Base URL:** `http://localhost:3000/api`
> **Swagger:** `http://localhost:3000/api/docs`
> **Cập nhật lần cuối:** 2026-05-22

---

## Quy ước

- **Admin API** prefix: `/api/admin-api/` — yêu cầu Admin JWT (qua middleware)
- **Client API** prefix: `/api/user-api/` — public hoặc Customer JWT tùy route
- `[JWT]` = yêu cầu Bearer token
- `[OPT]` = JWT optional (guest hoặc logged-in đều được)
- `[PUB]` = public, không cần auth

---

## Admin API — `/api/admin-api`

### Auth
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/auth/login` | PUB | login |
| POST | `/auth/refresh` | PUB | refresh |
| GET | `/auth/me` | JWT | getMe |

### Checkouts — Shipping Methods
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/checkouts/shipping-methods` | JWT | list |
| POST | `/checkouts/shipping-methods` | JWT | create |
| GET | `/checkouts/shipping-methods/:id` | JWT | getOne |
| PATCH | `/checkouts/shipping-methods/:id` | JWT | update |
| DELETE | `/checkouts/shipping-methods/:id` | JWT | remove |

### Checkouts — Carts
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/checkouts/carts` | JWT | list |
| GET | `/checkouts/carts/:id` | JWT | getOne |

### Checkouts — Sessions
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/checkouts/sessions` | JWT | list |
| GET | `/checkouts/sessions/:id` | JWT | getOne |

### Collections
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/collections/stats` | JWT | getStats |
| GET | `/collections` | JWT | list |
| POST | `/collections` | JWT | create |
| GET | `/collections/:id` | JWT | getOne |
| PATCH | `/collections/:id` | JWT | update |
| DELETE | `/collections/:id` | JWT | remove |
| PATCH | `/collections/:id/activate` | JWT | activate |
| PATCH | `/collections/:id/deactivate` | JWT | deactivate |
| PATCH | `/collections/:id/feature` | JWT | feature |
| PATCH | `/collections/:id/unfeature` | JWT | unfeature |
| PATCH | `/collections/:id/products` | JWT | assignProducts |

### Coupons
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/coupons/stats` | JWT | getStats |
| GET | `/coupons` | JWT | list |
| POST | `/coupons` | JWT | create |
| GET | `/coupons/:id` | JWT | getOne |
| PATCH | `/coupons/:id` | JWT | update |
| PATCH | `/coupons/:id/activate` | JWT | activate |
| PATCH | `/coupons/:id/deactivate` | JWT | deactivate |
| DELETE | `/coupons/:id` | JWT | remove |
| GET | `/coupons/:id/usages` | JWT | listUsages |
| POST | `/coupons/:id/restrictions` | JWT | addRestriction |
| DELETE | `/coupons/:id/restrictions/:restrictionId` | JWT | removeRestriction |
| POST | `/coupons/:id/whitelist` | JWT | addToWhitelist |
| DELETE | `/coupons/:id/whitelist/:whitelistId` | JWT | removeFromWhitelist |

### Orders
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/orders/stats` | JWT | getStats |
| GET | `/orders` | JWT | list |
| GET | `/orders/:id` | JWT | getOne |
| PATCH | `/orders/:id/status` | JWT | updateStatus |
| PATCH | `/orders/:id/payment-status` | JWT | updatePaymentStatus |
| PATCH | `/orders/:id/shipping` | JWT | updateShipping |
| POST | `/orders/:id/cancel` | JWT | cancel |
| DELETE | `/orders/:id` | JWT | remove |

### Payments
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/payments` | JWT | list |
| GET | `/payments/:id` | JWT | getOne |

### Products
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/products` | JWT | listProducts |
| POST | `/products` | JWT | createProduct |
| GET | `/products/:id` | JWT | getProduct |
| PATCH | `/products/:id` | JWT | updateProduct |
| DELETE | `/products/:id` | JWT | removeProduct |

### Products — Variants
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/products/:productId/variants` | JWT | listVariants |
| POST | `/products/:productId/variants` | JWT | createVariant |
| PATCH | `/products/:productId/variants/:variantId` | JWT | updateVariant |
| DELETE | `/products/:productId/variants/:variantId` | JWT | removeVariant |

### Products — Images
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/products/:productId/images/upload` | JWT | uploadImage (R2 presigned) |
| POST | `/products/:productId/images` | JWT | addImage |
| DELETE | `/products/:productId/images/:imageId` | JWT | removeImage |
| PATCH | `/products/:productId/images/reorder` | JWT | reorderImages |
| PATCH | `/products/:productId/images/:imageId/main` | JWT | setMain |

### Nail Shapes
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/nail-shapes` | JWT | listNailShapes |
| POST | `/nail-shapes` | JWT | createNailShape |
| GET | `/nail-shapes/:id` | JWT | getNailShape |
| PATCH | `/nail-shapes/:id` | JWT | updateNailShape |
| DELETE | `/nail-shapes/:id` | JWT | removeNailShape |

### Nail Sizes
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/nail-sizes` | JWT | listNailSizes |
| POST | `/nail-sizes` | JWT | createNailSize |
| GET | `/nail-sizes/:id` | JWT | getNailSize |
| PATCH | `/nail-sizes/:id` | JWT | updateNailSize |
| DELETE | `/nail-sizes/:id` | JWT | removeNailSize |

### Users
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/users` | JWT | list |
| GET | `/users/:id` | JWT | getOne |
| PATCH | `/users/:id` | JWT | update |
| DELETE | `/users/:id` | JWT | remove |

### Wholesales — Accounts
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/accounts/stats` | JWT | getStats |
| GET | `/wholesales/accounts` | JWT | list |
| GET | `/wholesales/accounts/:id` | JWT | getOne |
| PATCH | `/wholesales/accounts/:id` | JWT | update |
| DELETE | `/wholesales/accounts/:id` | JWT | remove |

### Wholesales — Enquiries
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/enquiries` | JWT | list |
| GET | `/wholesales/enquiries/:id` | JWT | getOne |
| PATCH | `/wholesales/enquiries/:id` | JWT | update |
| PATCH | `/wholesales/enquiries/:id/approve` | JWT | approve |
| PATCH | `/wholesales/enquiries/:id/reject` | JWT | reject |

### Wholesales — Tiers
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/tiers` | JWT | list |
| GET | `/wholesales/tiers/:id` | JWT | getOne |
| PATCH | `/wholesales/tiers/:id` | JWT | update |

### Wholesales — Newsletter
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/newsletter` | JWT | list |
| PATCH | `/wholesales/newsletter/:id` | JWT | update |

---

## Client API — `/api/user-api`

### Auth
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/auth/register` | PUB | register |
| POST | `/auth/login` | PUB | login |
| POST | `/auth/logout` | PUB | logout |
| POST | `/auth/refresh` | PUB | refresh |
| GET | `/auth/me` | JWT | getMe |
| POST | `/auth/forgot-password` | PUB | forgotPassword |
| POST | `/auth/reset-password` | PUB | resetPassword |

### Cart
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/cart` | OPT | getCart |
| POST | `/cart/items` | OPT | addItem |
| PATCH | `/cart/items/:itemId` | OPT | updateItem |
| DELETE | `/cart/items/:itemId` | OPT | removeItem |
| DELETE | `/cart` | OPT | clearCart |
| POST | `/cart/merge` | OPT | mergeCart |

### Checkout
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/checkout/shipping-methods` | OPT | listShippingMethods |
| POST | `/checkout` | OPT | createSession |
| GET | `/checkout/:id` | OPT | getSession |
| GET | `/checkout/:id/order` | OPT | getSessionOrder |
| PATCH | `/checkout/:id/contact` | OPT | updateContact |
| PATCH | `/checkout/:id/shipping` | OPT | updateShipping |
| POST | `/checkout/:id/coupon` | OPT | applyCoupon |
| DELETE | `/checkout/:id/coupon` | OPT | removeCoupon |

### Collections
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/collections/featured` | PUB | getFeatured |
| GET | `/collections` | PUB | list |
| GET | `/collections/:slug` | PUB | getBySlug |
| GET | `/collections/:slug/products` | PUB | getProducts |

### Coupons
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/coupons/validate` | PUB | validate |

### Currency
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/currency/exchange-rate` | PUB | getExchangeRate |

### Orders — Public tracking
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/orders/track` | PUB | trackOrder |

### Orders — My orders
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/orders/my` | JWT | getMyOrders |
| GET | `/orders/my/:orderId` | JWT | getMyOrder |

### Payments
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/payments/stripe/intent` | JWT | initiateStripe |
| POST | `/payments/paypal/create-order` | JWT | createPaypalOrder |
| POST | `/payments/paypal/capture` | JWT | capturePaypal |

### Products
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/products/shapes` | PUB | getShapes |
| GET | `/products/sizes` | PUB | getSizes |
| GET | `/products` | PUB | list |
| GET | `/products/slug/:slug` | PUB | getBySlug |
| GET | `/products/:id` | PUB | getOne |

### User Profile
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/user/profile` | JWT | getProfile |
| PATCH | `/user/profile` | JWT | updateProfile |
| GET | `/user/addresses` | JWT | listAddresses |
| POST | `/user/addresses` | JWT | addAddress |
| PATCH | `/user/addresses/:id` | JWT | updateAddress |
| DELETE | `/user/addresses/:id` | JWT | removeAddress |
| GET | `/user/orders` | JWT | listOrders |

### Webhooks
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/webhooks/stripe` | PUB | stripeWebhook |
| POST | `/webhooks/paypal` | PUB | paypalWebhook |

### Wholesales — Public
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/tiers` | PUB | getTiers |
| POST | `/wholesales/enquire` | PUB | submitEnquiry |
| POST | `/wholesales/newsletter/subscribe` | PUB | subscribe |
| POST | `/wholesales/newsletter/unsubscribe` | PUB | unsubscribe |

### Wholesales — Account (B2B)
| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| GET | `/wholesales/account` | JWT | getMyAccount |
| GET | `/wholesales/account/orders` | JWT | getMyOrders |

---

## Health & Root

| Method | Path | Handler |
| ------ | ---- | ------- |
| GET | `/api/` | root health check |
| GET | `/api/health` | getHealth |
| GET | `/api/health/live` | liveness probe |
| GET | `/api/health/ready` | readiness probe |

---

## Tổng kết

| Nhóm | Số endpoints |
| ---- | ------------ |
| Admin API | 85 |
| Client API | 47 |
| Health/Root | 4 |
| **Tổng** | **136** |
