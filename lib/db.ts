import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDb() {
  try {
    const env = getRequestContext().env as any;
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  } catch (e) {
    // Fallback for local dev if edge context is missing
    return new PrismaClient();
  }
}
