# syntax=docker/dockerfile:1

# Dépendances (respecte pnpm-lock.yaml)
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Build de l'application
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
# Copie du code source
COPY . .
# Variables d'environnement au build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Build Next.js (output standalone défini dans next.config.js)
RUN pnpm build

# Runtime minimal
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copie des artefacts standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

# Stage de développement
FROM node:22-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache bash
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]