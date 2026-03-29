import { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';

interface Landmark {
  node_id: number;
  floor_id: number;
  name_th: string;
  name_eng: string;
  type: string;
  x: number;
  z: number;
}
const ALLOWED_TYPES = ['elevator', 'room', 'stair'];
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setTarget } = useNavStore();

const suggestions = useMemo<Landmark[]>(() => {
  const trimmedQuery = query.trim().toLowerCase();
  const filteredByType = LANDMARK_ROWS_DATA.filter((loc) =>
    ALLOWED_TYPES.includes(loc.type.toLowerCase())
  );

  if (!trimmedQuery) {
    return filteredByType.slice(0, 5);
  }

  return filteredByType.filter((loc) =>
    loc.name_th.toLowerCase().includes(trimmedQuery) ||
    loc.name_eng.toLowerCase().includes(trimmedQuery)
  ).slice(0, 8);
}, [query]);

  const handleSelect = (loc: Landmark) => {
    setQuery('');
    setIsFocused(false);

    setTarget({
      location_id: loc.node_id,
      node_id: loc.node_id,
      name_th: loc.name_th,
      markerKey: `${loc.node_id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      floor: loc.floor_id,
      x: loc.x,
      z: loc.z,
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
              key={`${loc.node_id}-${loc.floor_id}-${loc.name_eng}`}
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