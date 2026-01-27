
FROM node:20-alpine AS deps
 
WORKDIR /app
 
# ติดตั้ง pnpm ทั่วโลก
RUN npm install -g pnpm
 
# คัดลอก package.json และ pnpm-lock.yaml เพื่อติดตั้ง dependencies
COPY package.json pnpm-lock.yaml ./
 
# ติดตั้ง dependencies ทั้งหมด (รวมถึง devDependencies ที่จำเป็นสำหรับการ build และ Prisma client generation)
RUN pnpm install --frozen-lockfile
 
# Stage 2: Builder
# ใช้ Node.js 20 Alpine เป็น base image สำหรับขั้นตอนการ build
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# คัดลอก pnpm และ node_modules จาก stage 'deps'
COPY --from=deps /usr/local/bin/pnpm /usr/local/bin/pnpm
COPY --from=deps /app/node_modules /app/node_modules
 
# คัดลอกโค้ดแอปพลิเคชันที่เหลือทั้งหมด
COPY . .
 
# สร้าง Prisma client (หากยังไม่ได้สร้างในขั้นตอน pnpm install)
# ขั้นตอนนี้สำคัญเพื่อให้แอปพลิเคชันสามารถใช้งาน Prisma ได้
RUN pnpm prisma generate
 
# Build แอปพลิเคชัน Next.js
RUN pnpm build
 
# Stage 3: Runner
# ใช้ Node.js 20 Alpine เป็น base image สำหรับรันแอปพลิเคชันใน production
FROM node:20-alpine AS runner
 
WORKDIR /app
 
# กำหนด NODE_ENV เป็น production
ENV NODE_ENV=production
 
# คัดลอก pnpm จาก stage 'deps'
COPY --from=deps /usr/local/bin/pnpm /usr/local/bin/pnpm
 
# คัดลอก package.json และ pnpm-lock.yaml เพื่อติดตั้งเฉพาะ production dependencies
RUN pnpm install --prod --frozen-lockfile
 
# คัดลอกไฟล์ที่ build แล้วจาก stage 'builder'
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
# คัดลอกโฟลเดอร์ prisma (schema.prisma และ migrations) เพื่อใช้ในการรัน migrate deploy
COPY --from=builder /app/prisma /app/prisma
 
# กำหนด port ที่ Next.js จะรัน
EXPOSE 3000
 
# คำสั่งสำหรับรันแอปพลิเคชัน
# ขั้นแรก: รัน Prisma migrations เพื่ออัปเดตฐานข้อมูล
# ขั้นสอง: เริ่มต้นแอปพลิเคชัน Next.js
CMD sh -c "npx prisma migrate deploy && pnpm start"
