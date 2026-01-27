
FROM node:20-alpine AS deps
 
WORKDIR /app
 
# คัดลอก package.json และ package-lock.json เพื่อติดตั้ง dependencies
# package-lock.json สำคัญมากสำหรับการติดตั้งที่แม่นยำและรวดเร็ว
COPY package.json package-lock.json ./
 
# ติดตั้ง dependencies ทั้งหมด (รวมถึง devDependencies) โดยใช้ npm ci ที่เหมาะสำหรับ CI/CD
RUN npm ci
 
# Stage 2: Builder
# ใช้ Node.js 20 Alpine เป็น base image สำหรับขั้นตอนการ build
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# คัดลอก node_modules จาก stage 'deps'
COPY --from=deps /app/node_modules /app/node_modules
 
# คัดลอกโค้ดแอปพลิเคชันที่เหลือทั้งหมด
COPY . .
 
# สร้าง Prisma client โดยใช้ npx
# ขั้นตอนนี้สำคัญเพื่อให้แอปพลิเคชันสามารถใช้งาน Prisma ได้
RUN npx prisma generate
 
# Build แอปพลิเคชัน Next.js
RUN npm run build
 
# Stage 3: Runner
# ใช้ Node.js 20 Alpine เป็น base image สำหรับรันแอปพลิเคชันใน production
FROM node:20-alpine AS runner
 
WORKDIR /app
 
# กำหนด NODE_ENV เป็น production
ENV NODE_ENV=production

# คัดลอก package.json และ package-lock.json เพื่อติดตั้งเฉพาะ production dependencies
COPY package.json package-lock.json ./

# ติดตั้งเฉพาะ production dependencies
RUN npm ci --omit=dev
 
# คัดลอกไฟล์ที่ build แล้วจาก stage 'builder'
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
# คัดลอกโฟลเดอร์ prisma (schema.prisma และ migrations) เพื่อใช้ในการรัน migrate deploy
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts prisma.config.ts
 
# กำหนด port ที่ Next.js จะรัน
EXPOSE 3000
 
# คำสั่งสำหรับรันแอปพลิเคชัน
# ขั้นแรก: รัน Prisma migrations เพื่ออัปเดตฐานข้อมูล
# ขั้นสอง: เริ่มต้นแอปพลิเคชัน Next.js
CMD sh -c "npx prisma migrate deploy && npm start"
