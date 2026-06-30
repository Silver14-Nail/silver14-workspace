# ============================================
# Base Stage - Install dependencies
# ============================================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

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

# Build all apps
RUN pnpm exec nx run-many -t build --projects=api,storefront,admin --parallel=3


# ============================================
# API Production Stage
# ============================================
FROM node:20-alpine AS api

WORKDIR /app

# Copy built API
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/.env ./.env

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
FROM node:20-alpine AS storefront

WORKDIR /app

# Copy built storefront
COPY --from=builder /app/dist/apps/storefront ./.next
COPY --from=builder /app/apps/storefront/public ./public
COPY --from=builder /app/apps/storefront/next.config.js ./
COPY --from=builder /app/apps/storefront/package.json ./
COPY --from=builder /app/node_modules ./node_modules

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
FROM node:20-alpine AS admin

WORKDIR /app

# Copy built admin
COPY --from=builder /app/dist/apps/admin ./.next
COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder /app/apps/admin/next.config.js ./
COPY --from=builder /app/apps/admin/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 4201

ENV NODE_ENV=production
ENV PORT=4201

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4201/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

# Start admin
CMD ["node_modules/.bin/next", "start", "-p", "4201"]
