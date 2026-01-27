FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the project
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy built application files and public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ในโหมด non-standalone จะคัดลอกโฟลเดอร์ .next ทั้งหมด
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy node_modules (production dependencies)
# ในโหมด non-standalone, node_modules จะไม่ถูกรวมอยู่ใน .next/standalone
# ดังนั้นต้องคัดลอก node_modules ทั้งหมดจาก stage 'deps'
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts # ถ้ามีและจำเป็นต้องใช้ใน runtime

USER nextjs

EXPOSE 3000

ENV CHECKPOINT_DISABLE=1
ENV DISABLE_PRISMA_TELEMETRY=true
ENV PORT=3000

ENV HOSTNAME="0.0.0.0" 

CMD ["npm", "start"] 