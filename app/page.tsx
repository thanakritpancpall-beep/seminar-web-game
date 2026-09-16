"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameOrPhone: name.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        // Fallback save
        try {
          localStorage.setItem("playerId", data.player.id.toString());
          localStorage.setItem("playerName", data.player.nameOrPhone);
        } catch(e) {}
        // Route with URL params
        router.push(`/game?pid=${data.player.id}&pname=${encodeURIComponent(data.player.nameOrPhone)}`);
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-sky-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
        <h1 className="text-3xl font-black text-[#005690] mb-2">เกมทายราคา</h1>
        <p className="text-gray-500 mb-8 font-bold text-lg">ALL ONLINE</p>
        
        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="กรอกชื่อ หรือ เบอร์โทรศัพท์" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#005690] text-lg text-gray-800"
            />
          </div>
          <button 
            type="button" 
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-[#005690] hover:bg-sky-800 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เริ่มเกมเลย!"}
          </button>
        </div>
      </div>
    </main>
  );
}
