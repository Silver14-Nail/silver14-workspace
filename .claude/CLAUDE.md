# CLAUDE.md — Silver14 Nail E-Commerce Workspace

## Overview

Nx monorepo for a nail art e-commerce platform targeting the EU market. Supports B2C (storefront) and B2B (wholesale). Package manager: **pnpm**.

---

## Project Structure

| App          | Framework | Path              | Port |
| ------------ | --------- | ----------------- | ---- |
| `storefront` | Next.js   | `apps/storefront` | 4200 |
| `admin`      | Next.js   | `apps/admin`      | 4201 |
| `api`        | NestJS    | `apps/api`        | 3000 |

### Shared Libraries (`libs/`)

| Library      | Purpose                                             |
| ------------ | --------------------------------------------------- |
| `ui`         | Shared React components (Shadcn-style, Radix UI)    |
| `types`      | Shared TypeScript interfaces for Order, Product     |
| `validators` | Zod schemas for product, order, checkout validation |
| `api-client` | Typed fetch wrapper for Supabase functions          |
| `config`     | Shared env config with Joi validation schema        |

---

## Commands

### Development

```bash
# Individual apps (root scripts)
pnpm run dev:storefront   # Next.js on port 4200
pnpm run dev:admin        # Next.js on port 4201
pnpm run dev:api          # NestJS on port 3000

# Via Nx
nx dev storefront
nx dev admin
nx serve api
```

### Build

```bash
nx build storefront
nx build admin
nx build api

# Build all
nx run-many -t build
```

### Test & Lint

```bash
nx test storefront
nx test admin
nx test api

# Affected only
nx affected --target=test
nx affected --target=lint
nx affected --target=lint,test   # run before committing
```

### Format

```bash
nx format:write
```

### Database (run from `apps/api/`)

```bash
pnpm run db:generate   # Generate migration from entity changes
pnpm run db:migrate    # Run pending migrations
pnpm run db:revert     # Undo last migration
pnpm run db:drop       # Drop entire schema (destructive!)
```

---

## API Architecture

- **Global prefix:** `/api`
- **Swagger docs:** `/api/docs`
- **Database:** MySQL via TypeORM (migrations-only, no sync)

### Module Structure

```
apps/api/src/app/
  admin-api/          # Protected admin endpoints (/api/admin-api)
    products/         # Products, nail shapes, nail sizes, pricing
    auth/             # Admin login, refresh token, user management
    users/            # Customer user management
    orders/           # Order listing, status updates
    wholesales/       # Wholesale accounts, enquiries, tiers, newsletter
  client-api/         # Customer-facing endpoints (/api/user-api)
  database/           # TypeORM module and DataSource setup

src/shared/
  auth/               # JWT service, token service, TOTP, guards, decorators
  db/
    entities/         # TypeORM entities grouped by domain
      auths/          # User, Address, UserSession, OAuth identities
      products/       # Product, NailShape, NailSize, ProductVariant, Images
      checkouts/      # Cart, CartItem, CheckoutSession, ShippingMethod
      orders/         # Order, OrderItem, CustomSizeRequest
      coupons/        # Coupon, CouponRestriction, CouponUsage
      wholesales/     # WholesaleAccount, WholesaleTier, WholesaleOrder
      payments/       # Payment, PayPalDetail, CardDetail
    migrations/       # Single migration file (1778824513200-create-tables.ts)
    ormconfig.ts      # TypeORM DataSource config
```

### Auth Patterns

- JWT access + refresh token flow
- TOTP (two-factor authentication)
- Roles: `customer` | `admin` | `wholesale`
- Admin routes protected via middleware in `AdminApiModule`
- `@CurrentUser()` decorator to extract user from request

---

## Code Style & Conventions

### General

- Language: **TypeScript** (strict mode OFF — use with care)
- Formatter: **Prettier** — single quotes, 100-char width, trailing commas, auto EOL
- Linter: **ESLint** with Nx module boundary rules

### Next.js (storefront & admin)

- Use **App Router** (`src/app/` directory)
- Server Components by default; add `"use client"` only when required
- Fetch data in Server Components or Route Handlers
- Styles: **Tailwind CSS**
- Shared components go in `libs/ui/`

### NestJS (api)

- Feature-based module structure
- DTOs with `class-validator` + `class-transformer` for validation
- Environment variables via `@nestjs/config` + Joi schema in `libs/config`
- Use `nest-router` for nested route groups
- Entities use soft deletes (`deleted_at`) for critical domains
- JSON columns for flexible data (OAuth profiles, shipping/contact snapshots)

---

## Git Workflow

- Branch naming: `feat/`, `fix/`, `chore/`
- Commit convention: **Conventional Commits**
  - `feat(scope): message`
  - `fix(scope): message`
  - `chore(scope): message`
- Always run `nx affected --target=lint,test` before committing
- Push to feature branch, open PR — **do not push directly to `main`**
- Husky is configured for pre-commit hooks

```bash
git add .
git commit -m "feat(api): add wholesale tier management"
git push origin feat/your-branch
```

---

## Environment Variables

| File                         | App                    |
| ---------------------------- | ---------------------- |
| `apps/storefront/.env.local` | Storefront             |
| `apps/admin/.env.local`      | Admin                  |
| `apps/api/.env`              | API (MySQL, JWT, CORS) |

Never commit `.env` files. Use `.env.example` as template.

---

## Notes for Claude

- Use **pnpm** (not npm or yarn) for all package operations
- Use **nx** commands — never call `next`, `nest`, or `webpack` directly
- When adding a new API module: create under `admin-api/` or `client-api/`, register in the parent module, add Swagger decorators
- Database changes require a TypeORM migration — **never set `synchronize: true`**
- Shared domain types belong in `libs/types`; Zod validation schemas in `libs/validators`
- Check `nx graph` before modifying shared libs to understand the dependency graph
- Prefer updating shared `libs/` over duplicating code across apps
