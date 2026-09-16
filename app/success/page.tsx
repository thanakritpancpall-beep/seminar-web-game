"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const urlPname = searchParams.get("pname");
    const localPname = localStorage.getItem("playerName");
    setPlayerName(urlPname || localPname || "คุณลูกค้าคนเก่ง");
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-500 to-[#005690]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform hover:scale-105 transition-transform duration-300">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-[#005690] mb-2">
          ยินดีด้วย!
        </h1>
        <p className="text-gray-600 font-medium mb-6">
          {playerName} ตอบถูกครบ 5 ข้อแล้ว
        </p>
        
        <div className="bg-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-300 mb-6">
          <p className="text-sm text-gray-500 mb-2">แสดงหน้าจอนี้ให้สตาฟฟ์ดูเพื่อรับรางวัล</p>
          <div className="text-4xl font-black tracking-widest text-[#005690]">
            WINNER
          </div>
        </div>

        <p className="text-sm text-gray-400">ขอบคุณที่ร่วมสนุกกับกิจกรรมนะคะ!</p>
      </div>
    </main>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#005690] flex items-center justify-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
