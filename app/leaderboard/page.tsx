"use client";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaders(data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 secs
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms === Infinity) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} นาที ${seconds} วินาที`;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-2">
          🏆 LEADERBOARD 🏆
        </h1>
        <p className="text-center text-slate-400 mb-10">ทำเนียบคนเก่งที่ตอบถูก 5 ข้อเร็วที่สุด</p>

        {loading && leaders.length === 0 ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700 text-slate-300">
                  <th className="p-4 font-semibold text-center w-20">อันดับ</th>
                  <th className="p-4 font-semibold">ชื่อ / เบอร์โทรศัพท์</th>
                  <th className="p-4 font-semibold text-right">เวลาที่ใช้</th>
                </tr>
              </thead>
              <tbody>
                {leaders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                      ยังไม่มีผู้ผ่านเข้ารอบ
                    </td>
                  </tr>
                ) : (
                  leaders.map((player, index) => (
                    <tr key={player.id} className="border-t border-slate-700 hover:bg-slate-750 transition-colors">
                      <td className="p-4 text-center">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : <span className="text-slate-400 font-bold">{index + 1}</span>}
                      </td>
                      <td className="p-4 font-medium text-lg">
                        {player.nameOrPhone}
                      </td>
                      <td className="p-4 text-right text-yellow-400 font-mono">
                        {formatTime(player.durationMs)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
