# Stage 1: ติดตั้ง Dependencies
# ใช้ node:20-alpine เป็น base image ที่มีขนาดเล็ก
FROM node:20-alpine AS deps
# ติดตั้ง libc6-compat สำหรับ Prisma Engine บน Alpine
# ดูเพิ่มเติม: https://github.com/prisma/prisma/issues/13948
RUN apk add --no-cache libc6-compat openssl
 
WORKDIR /app
 
# คัดลอกไฟล์ที่จำเป็นสำหรับการติดตั้ง dependencies
COPY package.json package-lock.json ./
# คัดลอก Prisma schema เพื่อให้ `prisma generate` ทำงานได้ตอน `npm ci`
COPY prisma ./prisma/
COPY prisma.config.ts ./ 
 
# ติดตั้ง dependencies ทั้งหมดด้วย `npm ci` เพื่อความรวดเร็วและแม่นยำ
RUN npm ci
RUN npx prisma generate
 
# Stage 2: Build Application
# ใช้ base image เดียวกันกับ stage ก่อนหน้า
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# คัดลอก node_modules ที่ติดตั้งแล้วจาก stage 'deps'
COPY --from=deps /app/node_modules /app/node_modules
 
# คัดลอกโค้ดของแอปพลิเคชันทั้งหมด
COPY . .
 
# Build Next.js app สำหรับ production
# โดยจะใช้ output 'standalone' ที่กำหนดใน next.config.js
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build
 
# Stage 3: Production Runner
# ใช้ base image ที่เล็กที่สุดเท่าที่จะทำได้
FROM node:20-alpine AS runner
 
WORKDIR /app
 
# กำหนด Environment เป็น production
ENV NODE_ENV=production
# ปิดการใช้งาน Telemetry ของ Next.js (optional)
# หากต้องการเปิดใช้งาน ให้เปลี่ยนเป็น ENV NEXT_TELEMETRY_DISABLED=1
# และลบเครื่องหมาย # ออก
# (แก้ไขตามคำเตือน "LegacyKeyValueFormat")
# ENV NEXT_TELEMETRY_DISABLED 1

# สร้าง user และ group สำหรับรันแอปพลิเคชันเพื่อความปลอดภัย (run as non-root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# คัดลอกไฟล์ที่จำเป็นจาก stage 'builder'
# เราจะคัดลอกเฉพาะไฟล์ที่จำเป็นสำหรับ production เท่านั้น
COPY --from=builder /app/public /app/public
# คัดลอก standalone output และเปลี่ยน owner เป็น user 'nextjs'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- จุดที่ต้องเพิ่ม: คัดลอก Prisma Client ที่ generate แล้ว ---
# สำคัญมาก: standalone จะไม่เอา prisma client ไปด้วยอัตโนมัติในบางกรณี
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma


COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma

# เปลี่ยนไปใช้ user ที่ไม่ใช่ root
USER nextjs
 
# กำหนด Port ที่จะให้แอปพลิเคชันทำงาน
EXPOSE 3001
ENV PORT 3001
 
# คำสั่งสำหรับรันแอปพลิเคชัน
# 1. รัน Prisma migrations
# 2. เริ่ม Next.js server จาก standalone output (server.js)
CMD ["node", "server.js"]
