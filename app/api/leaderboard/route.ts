export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const players = await getDb().player.findMany({
      where: { status: "FINISHED" }
    });
    
    const ranked = players.map(p => ({
      ...p,
      durationMs: p.endTime ? (new Date(p.endTime).getTime() - new Date(p.startTime).getTime()) : Infinity
    })).sort((a, b) => {
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.durationMs - b.durationMs;
    }).slice(0, 10);
    
    return NextResponse.json({ leaderboard: ranked });
  } catch(e) {
    return NextResponse.json({error: "Server Error"}, {status: 500});
  }
}

