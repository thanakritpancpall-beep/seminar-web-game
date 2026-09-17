"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/products/stats");
      if (res.ok) {
        const data = await res.json();
        setProductCount(data.count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchStats();
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Admin Login</h2>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg mb-4 text-black focus:outline-blue-500" placeholder="Password" />
          <button onClick={() => password === "admin1234" ? setLoggedIn(true) : alert("รหัสผ่านไม่ถูกต้อง")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg">เข้าสู่ระบบ</button>
        </div>
      </div>
    )
  }

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, password })
        });
        if(res.ok) {
          const result = await res.json();
          alert(อัปโหลดสำเร็จ! (ทั้งหมด  + result.count +  รายการ));
          fetchStats();
        } else {
          alert("เกิดข้อผิดพลาด: " + (result.details || result.error || "โปรดลองใหม่"));
        }
      } catch(err) {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel");
      }
      setLoading(false);
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  }

  const handleResetPlayers = async () => {
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลผู้เล่นและคะแนนทั้งหมด? (ข้อมูลจะถูกลบและไม่สามารถกู้คืนได้)")) return;
    
    setResetLoading(true);
    try {
      const res = await fetch("/api/player/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        alert("ล้างข้อมูลผู้เล่นทั้งหมดเรียบร้อยแล้ว!");
      } else {
        alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
      }
    } catch(e) {
      alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
    }
    setResetLoading(false);
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel (ระบบหลังบ้าน)</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-gray-500 font-semibold mb-1">สถานะฐานข้อมูลสินค้า</h2>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-600">{productCount !== null ? productCount : "..."}</span>
              <span className="text-gray-600 mb-1">รายการ</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">1. อัปเดตข้อมูลสินค้า (Excel)</h2>
          <p className="mb-6 text-gray-500 text-sm">การอัปโหลดใหม่จะลบข้อมูลเก่าทิ้งทั้งหมด กรุณาเตรียมไฟล์ที่มีคอลัมน์: image no. | Amos | product_name | price</p>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4 cursor-pointer" />
          {loading && <p className="text-blue-600 font-semibold animate-pulse">กำลังแปลงไฟล์และบันทึกลงฐานข้อมูล...</p>}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200">
          <h2 className="text-xl font-semibold mb-2 text-red-700">2. ล้างข้อมูลผู้เล่น (Reset Game)</h2>
          <p className="mb-6 text-gray-500 text-sm">ใช้สำหรับเคลียร์คะแนนและรายชื่อผู้เล่นทั้งหมด เพื่อเตรียมพร้อมสำหรับงานสัมมนารอบใหม่</p>
          <button 
            onClick={handleResetPlayers} 
            disabled={resetLoading} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {resetLoading ? "กำลังล้างข้อมูล..." : "🗑️ ล้างข้อมูลผู้เล่นทั้งหมด"}
          </button>
        </div>
      </div>
    </div>
  )
}

