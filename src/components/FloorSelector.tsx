import { useState } from 'react';
import { useNavStore } from '../store/useNavStore';

export default function FloorSelector() {
  const [pendingFloor, setPendingFloor] = useState<number | null>(null);

  const { 
    currentFloor, 
    isRecalibrating,
    setFloor,
    setTarget,
    userId, // ✅ เปลี่ยนจาก guestId เป็น userId ให้ตรงกับ Store ตัวล่าสุด
    userPosition, 
    targetLocation 
  } = useNavStore();

  const applyFloorChange = (floor: number) => {
    // --- 📊 ส่วนของ Log สำหรับเช็คการทำงาน ---
    console.log("------- Floor Change Check -------");
    console.log("Floor Selected:", floor);
    console.log("User ID (Guest):", userId); // ✅ จะไม่ undefined แล้ว
    console.log("Current User Position (3D):", userPosition);
    // --- 📊 ส่วนของ Log สำหรับเช็คการทำงาน ---
    // ตรวจสอบพิกัดเป้าหมายที่เลือกจาก SearchBox
    if (targetLocation) {
      console.log("Target Destination:", {
        id: targetLocation.location_id,
        node: targetLocation.node_id,
        name: targetLocation.name_th,
        floor: targetLocation.floor
      });
    } else {
      console.log("Target Destination: null (ยังไม่ได้เลือกสถานที่)");
    }
    console.log("----------------------------------");

    // เปลี่ยนชั้นที่กำลังดู (ไม่กระทบชั้นจริง)
    setTarget(null);
    setFloor(floor);
  };
  
  const floors = [6, 5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      {floors.map((f) => {
        const isActive = currentFloor === f;
        return (
          <button 
            key={f} 
            onClick={() => {
              if (f === currentFloor) {
                return;
              }

              if (isRecalibrating) {
                setPendingFloor(f);
                return;
              }

              applyFloorChange(f);
            }}
            className={`w-14 h-14 rounded-2xl shadow-xl font-black transition-all flex items-center justify-center border-2 ${
              isActive 
                ? '!bg-blue-600 text-white border-blue-400 scale-110 shadow-blue-500/50' 
                : 'bg-white text-slate-800 border-transparent hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span className="text-2xl relative z-10">{f}</span>
          </button>
        );
      })}

      {pendingFloor !== null && (
        <div className="fixed inset-0 z-[1200] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => setPendingFloor(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องยืนยัน"
          />

          <div className="relative w-full max-w-xs rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-amber-300 uppercase tracking-wide">
              Recalibrate Active
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              กำลังอยู่ในโหมด Recalibrate ต้องการเปลี่ยนไปชั้น {pendingFloor} ใช่ไหม?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPendingFloor(null)}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const floor = pendingFloor;
                  setPendingFloor(null);
                  if (floor !== null) {
                    applyFloorChange(floor);
                  }
                }}
                className="py-2 rounded-xl bg-red-600 hover:bg-red-500 transition-colors font-bold text-sm"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}