export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { data, password } = await req.json();
    if (password !== "admin1234") return NextResponse.json({error: "Unauthorized"}, {status: 401});
    
    const db = getDb();
    
    // Clear old products
    await db.product.deleteMany(); 
    
    let count = 0;
    for (const item of data) {
      const imageNo = String(item["image no."] || item.imageNo || "");
      if (!imageNo) continue;
      
      await db.product.create({
        data: {
          imageNo: imageNo,
          amos: String(item.Amos || item.amos || ""),
          name: String(item.product_name || item.name || ""),
          price: Number(item.price || 0),
          imageUrl: "/images/" + imageNo + ".jpg"
        }
      });
      count++;
    }
    
    return NextResponse.json({ success: true, count });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({error: "Server Error", details: e.message}, {status: 500});
  }
}
