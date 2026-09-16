export const runtime = 'edge';
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { data, password } = await req.json();
    if (password !== "admin1234") return NextResponse.json({error: "Unauthorized"}, {status: 401});
    
    await getDb().product.deleteMany(); // Clear old products
    
    const formatted = data.map((item: any) => {
      const imageNo = String(item["image no."] || item.imageNo || "");
      return {
        imageNo: imageNo,
        amos: String(item.Amos || item.amos || ""),
        name: String(item.product_name || item.name || ""),
        price: Number(item.price || 0),
        imageUrl: `/images/${imageNo}.jpg`
      };
    });
    
    await getDb().product.createMany({ data: formatted });
    return NextResponse.json({ success: true, count: formatted.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: "Server Error"}, {status: 500});
  }
}

