# CLAUDE.md — Silver14 Nail E-Commerce Workspace

Nx monorepo, nail art e-commerce, EU market. B2C storefront + B2B wholesale. Package manager: **pnpm**.

## Spec Files

Đọc các file này khi bắt đầu session mới:
- `.claude/specs/project.spec.md` — cấu trúc toàn bộ project (apps, libs, entities, routes, env vars)
- `.claude/specs/api-endpoints.spec.md` — 136 API endpoints đầy đủ (method, path, auth)

---

## Commands

```bash
# Dev
pnpm run dev:storefront   # port 4200
pnpm run dev:admin        # port 4201
pnpm run dev:api          # port 3000

# Build
nx build storefront / admin / api
nx run-many -t build

# Test & Lint (chạy trước khi commit)
nx affected --target=lint,test

# Format
nx format:write

# Database (chạy từ apps/api/)
pnpm run db:generate   # tạo migration từ entity changes
pnpm run db:migrate    # chạy migration
pnpm run db:revert     # undo migration cuối
pnpm run db:drop       # xóa toàn bộ schema — DESTRUCTIVE
```

---

## Code Style & Conventions

### General
- **TypeScript** — strict mode OFF
- **Prettier** — single quotes, 100-char width, trailing commas, auto EOL
- **ESLint** + Nx module boundary rules

### Next.js (storefront & admin)
- App Router (`src/app/`), Server Components by default
- `"use client"` chỉ khi thực sự cần
- Styles: **Tailwind CSS**
- Shared components → `libs/ui/`

### NestJS (api)
- Feature-based module structure
- DTOs dùng `class-validator` + `class-transformer`
- Env vars qua `@nestjs/config` + Joi schema trong `libs/config`
- Entities dùng soft delete (`deleted_at`) cho critical domains
- JSON columns cho flexible data (OAuth profiles, shipping/contact snapshots)

---

## Git Workflow

- Branch: `feat/`, `fix/`, `chore/`
- Commits: Conventional Commits — `feat(scope): message`
- **Không** push thẳng vào `main` — luôn mở PR
- Husky pre-commit hooks đang active
- Chạy `nx affected --target=lint,test` trước khi commit

---

## Notes for Claude

- Dùng **pnpm**, không dùng npm hoặc yarn
- Dùng **nx** commands — không gọi `next`, `nest`, `webpack` trực tiếp
- Thêm API module mới: tạo dưới `admin-api/` hoặc `client-api/`, register trong parent module, thêm Swagger decorators
- DB thay đổi → tạo TypeORM migration — **không bao giờ set `synchronize: true`**
- Domain types → `libs/types` | Zod schemas → `libs/validators`
- Kiểm tra `nx graph` trước khi sửa shared libs
- Ưu tiên cập nhật `libs/` thay vì duplicate code giữa các apps
