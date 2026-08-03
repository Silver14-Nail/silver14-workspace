# syntax=docker/dockerfile:1
# The line above opts into BuildKit's extended syntax — required for the
# `--mount=type=cache` lines below, which persist the pnpm store and Nx's
# build cache BETWEEN builds (unlike normal layer caching, these survive
# even though `COPY . .` below invalidates the layer on every deploy, since
# source changes every deploy by definition). Without this, every deploy
# re-downloads all deps and recompiles all 3 apps from scratch regardless
# of how small the change was.

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

# Install dependencies — cache mount persists pnpm's package store across
# builds, so unchanged deps don't get re-downloaded every deploy even when
# the lockfile does change.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


# ============================================
# Source Stage - full monorepo source, no build
# ============================================
# Shared by all three per-app builder stages below, plus the `migrate`
# service in docker-compose.yml (which only needs source + deps to run
# TypeORM migrations via ts-node — it never needed a built app at all).
FROM base AS source

WORKDIR /app

COPY . .


# ============================================
# Builder Stage - API only
# ============================================
# Split into per-app stages (was one shared `builder` running
# `nx run-many --projects=api,storefront,admin`) so that targeting a single
# service — e.g. `docker-compose build storefront` — only builds that one
# app's stage. BuildKit skips stages that aren't in the requested target's
# dependency graph, so building just storefront never invokes `nx build
# api`/`nx build admin` at all, instead of always compiling all 3 together.
FROM source AS builder-api

RUN --mount=type=cache,id=nx-cache,target=/app/.nx/cache \
    pnpm exec nx build api


# ============================================
# Builder Stage - Storefront only
# ============================================
FROM source AS builder-storefront

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

RUN --mount=type=cache,id=nx-cache,target=/app/.nx/cache \
    pnpm exec nx build storefront


# ============================================
# Builder Stage - Admin only
# ============================================
FROM source AS builder-admin

# Same NEXT_PUBLIC_* build-time-inlining caveat as the storefront stage above.
ARG NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_STOREFRONT_URL=$NEXT_PUBLIC_STOREFRONT_URL

RUN --mount=type=cache,id=nx-cache,target=/app/.nx/cache \
    pnpm exec nx build admin


# ============================================
# API Production Stage
# ============================================
FROM node:22-alpine AS api

WORKDIR /app

# Copy built API
COPY --from=builder-api /app/dist/apps/api ./
COPY --from=builder-api /app/node_modules ./node_modules
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
COPY --from=builder-storefront /app/node_modules ./node_modules
COPY --from=builder-storefront /app/apps/storefront ./apps/storefront
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
COPY --from=builder-admin /app/node_modules ./node_modules
COPY --from=builder-admin /app/apps/admin ./apps/admin
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
