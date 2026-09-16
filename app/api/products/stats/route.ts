export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const count = await db.product.count();
    return NextResponse.json({ count });
  } catch (e) {
    return NextResponse.json({ count: 0 });
  }
}
