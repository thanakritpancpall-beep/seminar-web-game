export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    const exclude = searchParams.get("exclude") || "";
    
    if (!playerId) return NextResponse.json({error: "No player"}, {status: 400});

    const player = await getDb().player.findUnique({ where: { id: parseInt(playerId) } });
    if (!player) return NextResponse.json({error: "Player not found"}, {status: 404});

    const excludeIds = exclude.split(",").filter(Boolean).map(Number);
    
    let products = await getDb().product.findMany({
      where: { id: { notIn: excludeIds } }
    });
    
    if (products.length === 0) {
      products = await getDb().product.findMany(); // reset if all seen
    }
    if (products.length === 0) return NextResponse.json({error: "No products"}, {status: 404});

    const randomIdx = Math.floor(Math.random() * products.length);
    const product = products[randomIdx];

    return NextResponse.json({ 
      player, 
      product: { id: product?.id, name: product?.name, imageUrl: product?.imageUrl, amos: product?.amos } 
    });
  } catch (e) {
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const { playerId, productId, price } = await req.json();
    
    const product = await getDb().product.findUnique({ where: { id: parseInt(productId) }});
    if (!product) return NextResponse.json({error: "No product"}, {status: 404});

    const isCorrect = Number(price) === product.price;
    let player = await getDb().player.findUnique({ where: { id: parseInt(playerId) }});
    
    if (isCorrect && player) {
      player = await getDb().player.update({
        where: { id: player.id },
        data: { correctCount: player.correctCount + 1 }
      });
      
      if (player.correctCount >= 5) {
        await getDb().player.update({
          where: { id: player.id },
          data: { status: "FINISHED", endTime: new Date() }
        });
      }
    }

    return NextResponse.json({ 
      correct: isCorrect, 
      actualPrice: product.price,
      player 
    });
  } catch (e) {
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}

