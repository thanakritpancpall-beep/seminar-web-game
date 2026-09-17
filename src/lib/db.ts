import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

let prisma: PrismaClient | null = null;

export function getDb() {
  if (prisma) return prisma;

  const env = getRequestContext().env as any;
  
  if (!env || !env.DB) {
    throw new Error("การเชื่อมต่อฐานข้อมูลล้มเหลว: ไม่พบตัวแปร DB (กรุณาเช็กว่าตั้งค่า D1 Database Binding ใน Cloudflare ถูกต้องหรือไม่)");
  }

  const adapter = new PrismaD1(env.DB);
  prisma = new PrismaClient({ adapter });
  
  return prisma;
}
