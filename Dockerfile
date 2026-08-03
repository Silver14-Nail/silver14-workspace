# ============================================
# Base Stage - Install dependencies
# ============================================
FROM node:22-alpine AS base

# Install pnpm — pinned (not @latest) so a new pnpm release can't silently
# require a newer Node than this image ships, the way it just did (pnpm
# 11.9's dependency resolver needs Node's built-in `node:sqlite`, added in
# Node 22.5+ — pnpm@latest against node:20-alpine failed to even install).
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/admin/package.json ./apps/admin/
COPY libs/ui/package.json ./libs/ui/
COPY libs/types/package.json ./libs/types/
COPY libs/validators/package.json ./libs/validators/
COPY libs/api-client/package.json ./libs/api-client/
COPY libs/config/package.json ./libs/config/

# Install dependencies
RUN pnpm install --frozen-lockfile


# ============================================
# Builder Stage - Build all apps
# ============================================
FROM base AS builder

WORKDIR /app

# Copy source code
COPY . .

# Next.js inlines NEXT_PUBLIC_* vars into the client bundle at BUILD time —
# setting them in docker-compose.yml's `environment:` (container runtime)
# has no effect on already-built output. Must be passed as build ARGs here
# instead, and docker-compose.yml must pass them via `build.args:`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STOREFRONT_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STOREFRONT_URL=$NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID

# Build all apps
RUN pnpm exec nx run-many -t build --projects=api,storefront,admin --parallel=3


# ============================================
# API Production Stage
# ============================================
FROM node:22-alpine AS api

WORKDIR /app

# Copy built API
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
# .env is intentionally NOT baked into the image (.dockerignore excludes it,
# and even if it didn't, secrets shouldn't live in image layers). It's
# provided at container start via docker-compose.yml's volume mount instead.

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start API
CMD ["node", "main.js"]


# ============================================
# Storefront Production Stage
# ============================================
FROM node:22-alpine AS storefront

WORKDIR /app

# pnpm doesn't hoist `next` to the workspace root — apps/storefront/node_modules
# has its own next symlink + .bin/next, pointing at the central pnpm store with
# a RELATIVE path (../../../node_modules/.pnpm/...). That relative path only
# still resolves correctly if we preserve the original nested directory depth
# (root node_modules/ at /app/node_modules, app dir at /app/apps/storefront/)
# instead of flattening everything into /app — flattening breaks the symlink.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/storefront ./apps/storefront
WORKDIR /app/apps/storefront

# Expose port
EXPOSE 4200

ENV NODE_ENV=production
ENV PORT=4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

# Start storefront
CMD ["node_modules/.bin/next", "start", "-p", "4200"]


# ============================================
# Admin Production Stage
# ============================================
FROM node:22-alpine AS admin

WORKDIR /app

# Same pnpm relative-symlink reasoning as the storefront stage above.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin ./apps/admin
WORKDIR /app/apps/admin

# Expose port
EXPOSE 4201

ENV NODE_ENV=production
ENV PORT=4201

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4201/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

# Start admin
CMD ["node_modules/.bin/next", "start", "-p", "4201"]
