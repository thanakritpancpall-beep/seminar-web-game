"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priceInput, setPriceInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{text: string, type: "error"|"success"} | null>(null);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchQuestion = async (pid: string, currentSeen: number[], pName: string) => {
    setLoading(true);
    setHint(null);
    setFeedback(null);
    setPriceInput("");
    setWrongAttempts(0);
    try {
      const res = await fetch(`/api/game?playerId=${pid}&exclude=${currentSeen.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        if (data.player?.status === "FINISHED") {
          router.push(`/success?pname=${encodeURIComponent(pName)}`);
          return;
        }
        setProduct(data.product);
        setCorrectCount(data.player?.correctCount || 0);
        setSeenIds([...currentSeen, data.product.id]);
      } else {
        setInitError("ไม่พบข้อมูลคำถามในระบบ");
      }
    } catch (e) {
      console.error(e);
      setInitError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
    setLoading(false);
  };

  useEffect(() => {
    const urlPid = searchParams.get("pid");
    const urlPname = searchParams.get("pname");
    
    let localId = null;
    let localName = null;
    try {
      localId = localStorage.getItem("playerId");
      localName = localStorage.getItem("playerName");
    } catch(e) {}
    
    const finalId = urlPid || localId;
    const finalName = urlPname || localName || "";
    
    if (!finalId) {
      setInitError("ไม่พบรหัสผู้เล่น กรุณากลับไปหน้าแรก");
      setLoading(false);
      return;
    }
    
    try {
      if (urlPid) localStorage.setItem("playerId", urlPid);
      if (urlPname) localStorage.setItem("playerName", urlPname);
    } catch(e) {}

    setPlayerId(finalId);
    setPlayerName(finalName);
    fetchQuestion(finalId, [], finalName);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!priceInput || !playerId || !product) return;
    setLoading(true);
    setFeedback(null);
    
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          productId: product.id,
          price: priceInput
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.correct) {
          if (data.player.correctCount >= 5) {
            router.push(`/success?pname=${encodeURIComponent(playerName)}`);
          } else {
            fetchQuestion(playerId, seenIds, playerName);
          }
        } else {
          const newAttempts = wrongAttempts + 1;
          setWrongAttempts(newAttempts);
          setPriceInput("");
          setLoading(false);
          
          if (newAttempts >= 5) {
            setFeedback({text: "ผิดครบ 5 ครั้ง ขอข้ามไปข้อถัดไปนะคะ 😅", type: "error"});
            setTimeout(() => fetchQuestion(playerId, seenIds, playerName), 2000);
          } else {
            setFeedback({text: "❌ ยังไม่ถูกค่ะ ลองใหม่อีกครั้งนะคะ", type: "error"});
            if (newAttempts === 3) {
              const actualStr = data.actualPrice.toString();
              let place = "หลักหน่วย";
              if(actualStr.length === 2) place = "หลักสิบ";
              if(actualStr.length === 3) place = "หลักร้อย";
              if(actualStr.length === 4) place = "หลักพัน";
              if(actualStr.length === 5) place = "หลักหมื่น";
              
              setHint(`คำใบ้: ${place} คือเลข ${actualStr[0]}`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!playerId) return;
    fetchQuestion(playerId, seenIds, playerName);
  };

  if (initError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-sky-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
          <p className="text-red-600 font-bold mb-4">{initError}</p>
          <button onClick={() => router.push("/")} className="bg-[#005690] text-white px-6 py-2 rounded-lg">
            กลับไปหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  if (!product && !loading && !feedback) {
    return <div className="p-8 text-center text-black">ไม่มีข้อมูลสินค้าในระบบ</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-sky-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl mt-4 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#005690]">👤 {playerName}</h2>
          <div 
            className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition" 
            onClick={() => window.open('https://allonline.link/r/Q9XDE', '_blank')}
          >
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src="/images/all-online-logo.png" alt="ALL ONLINE" className="h-14 object-contain mb-1" />
             <span className="text-[10px] text-[#005690] font-bold leading-tight">กดที่โลโก้ เพื่อไปหน้า</span>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap">
            ถูก {correctCount}/5
          </span>
        </div>
        
        {loading && !feedback ? (
          <div className="text-center py-20 text-gray-500 font-bold animate-pulse">กำลังโหลดสินค้าถัดไป...</div>
        ) : (
          <div className="text-center space-y-3">
            <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product?.imageUrl} alt={product?.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display="none" }} />
            </div>
            
            <div>
              <h3 className="text-md font-semibold text-gray-800 line-clamp-2 min-h-[1.5rem] mt-3">{product?.name}</h3>
              {product?.amos && (
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-sm font-medium text-gray-500">รหัสสินค้า: {product.amos}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(product.amos);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs transition-colors"
                  >
                    {copied ? <span className="text-green-600 font-bold">Copy!</span> : "📋 Copy"}
                  </button>
                </div>
              )}
            </div>
            
            {hint && (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg font-bold text-sm border border-yellow-200 shadow-sm animate-pulse">
                💡 {hint}
              </div>
            )}
            
            {feedback && (
              <div className={`p-3 rounded-lg font-bold text-sm ${feedback.type === "error" ? "text-red-600 bg-red-50 border border-red-200" : "text-green-600 bg-green-50 border border-green-200"}`}>
                {feedback.text}
              </div>
            )}
            
            <div className="pt-2">
              <input 
                type="number" 
                placeholder="ทายราคา (บาท)" 
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005690] focus:border-[#005690] outline-none text-center text-2xl font-bold text-[#005690]"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={handleSkip} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-colors cursor-pointer">
                ข้าม ⏭️
              </button>
              <button onClick={handleSubmit} className="w-2/3 bg-[#005690] hover:bg-sky-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md cursor-pointer">
                ส่งคำตอบ 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Game() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sky-50 flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>}>
      <GameContent />
    </Suspense>
  );
}


