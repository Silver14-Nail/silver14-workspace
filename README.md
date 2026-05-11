# Nail Mini E-Commerce

Nx monorepo cho du an website ban bo nail nghe thuat huong den thi truong EU.

Workspace nay gom 3 app chinh:

- `storefront`: website cho end user, uu tien SEO va trai nghiem mua hang.
- `admin`: web app CMS/admin de quan tri san pham, collection, don hang va cac cau hinh van hanh.
- `api`: NestJS backend API cho nghiep vu ecommerce.

## Tech Stack

- Monorepo: Nx
- Package manager: pnpm
- Runtime: Node.js 24
- Frontend framework: Next.js App Router
- Backend framework: NestJS
- Language: TypeScript
- Styling: Tailwind CSS
- UI utilities: clsx, tailwind-merge, class-variance-authority, lucide-react
- Forms/validation: React Hook Form, Zod, @hookform/resolvers
- Data/table: TanStack Query, TanStack Table
- Test: Jest
- Lint/format: ESLint, Prettier

## Cau Truc

```txt
apps/
  api/              # NestJS backend API
  storefront/       # Public ecommerce storefront
  admin/            # CMS/admin web app

libs/
  ui/               # Shared React UI components
  types/            # Shared frontend/domain types
  validators/       # Zod schemas and inferred types
  api-client/       # Typed fetch client for backend API
  config/           # Shared app config and env helpers
```

## Yeu Cau Moi Truong

Can dung Node.js 24 truoc khi cai dependency hoac chay project:

```sh
nvs use node24
```

Kiem tra version:

```sh
node -v
pnpm -v
```

Tren PowerShell, neu `npm`/`pnpm` bi chan do execution policy, dung binary `.cmd`:

```sh
pnpm.cmd install
```

## Cai Dat

```sh
nvs use node24
pnpm.cmd install
```

## Chay Development

Storefront:

```sh
pnpm.cmd dev:storefront
```

Mac dinh chay tai:

```txt
http://localhost:4200
```

Admin:

```sh
pnpm.cmd dev:admin
```

Mac dinh chay tai:

```txt
http://localhost:4201
```

API:

```sh
pnpm.cmd dev:api
```

Mac dinh chay tai:

```txt
http://localhost:3000/api
```

Co the chay truc tiep bang Nx:

```sh
pnpm.cmd nx dev storefront --port=4200
pnpm.cmd nx dev admin --port=4201
pnpm.cmd nx serve api
```

## Build

Build tat ca project co target `build`:

```sh
pnpm.cmd build
```

Build rieng tung app:

```sh
pnpm.cmd nx build storefront
pnpm.cmd nx build admin
pnpm.cmd nx build api
```

Chay production server sau khi build:

```sh
pnpm.cmd nx start storefront --port=4300
pnpm.cmd nx start admin --port=4301
$env:PORT = '3000'
pnpm.cmd nx serve api
```

## Lint, Test, Sync

Lint:

```sh
pnpm.cmd lint
```

Unit test:

```sh
pnpm.cmd test
```

Dong bo Nx/TypeScript project references sau khi them app/lib:

```sh
pnpm.cmd nx sync
```

Kiem tra tong hop:

```sh
pnpm.cmd nx run-many -t lint test build
```

## Quy Uoc Phat Trien

- Logic nghiep vu quan trong nhu tinh tong don hang, discount, shipping fee va payment status phai nam trong `apps/api`.
- Frontend chi nen giu UI state, client validation, API client, format/display helpers.
- Shared code dung chung cho `storefront`, `admin` va `api` dat trong `libs`.
- Khi app dung mot workspace lib, khai bao dependency bang `workspace:*` trong `package.json` cua app do.
- Khong import truc tiep backend internals vao frontend. Neu can dung chung, dua vao `libs/types`, `libs/validators` hoac lib contract rieng.

## Lenh Huu Ich

Xem danh sach projects:

```sh
pnpm.cmd nx show projects
```

Xem target cua mot project:

```sh
pnpm.cmd nx show project storefront
pnpm.cmd nx show project admin
pnpm.cmd nx show project api
```

Xem dependency graph:

```sh
pnpm.cmd nx graph
```

Format code:

```sh
pnpm.cmd exec prettier --write .
```
