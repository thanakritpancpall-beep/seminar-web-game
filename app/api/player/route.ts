export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nameOrPhone } = body;

    if (!nameOrPhone) {
      return NextResponse.json({ error: "Name or phone is required" }, { status: 400 });
    }

    let player = await getDb().player.findUnique({
      where: { nameOrPhone }
    });

    if (!player) {
      player = await getDb().player.create({
        data: { nameOrPhone }
      });
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

