// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // لتجنّب إنشاء PrismaClient جديد في بيئة التطوير عند التحديث السريع
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
