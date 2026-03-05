import { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
// ✅ ตอนนี้จะหาไฟล์เจอแล้วถ้าทำตามข้อ 1
import { LANDMARKS_DATA } from '../data/landmark'; 

// ✅ กำหนด Interface ให้ตรงกับ Supabase (lng/lat, name_th/eng)
interface Landmark {
  node_id: number;
  floor_id: number;
  name_th: string;
  name_eng: string;
  type: string;
  lng: number;
  lat: number;
}
const ALLOWED_TYPES = ['elevator', 'room', 'stair'];
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setTarget } = useNavStore();

// ✅ กำหนดรายการ Type ที่อนุญาตให้แสดง

const suggestions = useMemo<Landmark[]>(() => {
  const trimmedQuery = query.trim().toLowerCase();
  
  // 1. กรองเฉพาะ Type ที่เราต้องการก่อน (elevator, room, stair)
  const filteredByType = LANDMARKS_DATA.filter(loc => 
    ALLOWED_TYPES.includes(loc.type.toLowerCase())
  );

  // 2. ถ้าไม่ได้พิมพ์อะไร ให้โชว์ 5 อันแรกจากรายการที่กรองแล้ว
  if (!trimmedQuery) {
    return filteredByType.slice(0, 5);
  }

  // 3. ค้นหาจากรายการที่กรอง Type มาแล้วเท่านั้น
  return filteredByType.filter(loc => 
    loc.name_th.toLowerCase().includes(trimmedQuery) ||
    loc.name_eng.toLowerCase().includes(trimmedQuery)
  ).slice(0, 8); 
}, [query]);


  // ✅ ใส่ Type ให้ loc: Landmark
  const handleSelect = (loc: Landmark) => {
    console.log("📍 Selected:", loc);
    setQuery(''); 
    setIsFocused(false);
    
    // ส่งค่าเข้า Store (อ้างอิงตามโครงสร้าง Store ของคุณ)
    setTarget({
      location_id: loc.node_id,
      node_id: loc.node_id,
      name_th: loc.name_th,
      floor: loc.floor_id
    });
  };

  return (
    <div className="relative w-full max-w-md pointer-events-auto">
      <input
        type="text"
        value={query}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาห้องหรือสถานที่..."
        className="w-full px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-all font-medium"
      />

      {(isFocused || query.length > 0) && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[100] max-h-[350px] overflow-y-auto">
          {suggestions.map((loc) => (
            <div
              key={loc.node_id}
              onClick={() => handleSelect(loc)}
              className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-none transition-colors group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {loc.name_th}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {loc.name_eng}
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black">
                  ชั้น {loc.floor_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}