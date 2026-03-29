import { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';

interface Landmark {
  node_id: number | null;
  floor_id: number;
  name_th: string;
  name_eng: string;
  type: string;
  x?: number | null;
  z?: number | null;
  ax?: number | null;
  az?: number | null;
  bx?: number | null;
  bz?: number | null;
}
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<Landmark | null>(null);
  const {
    setTarget,
    isRecalibrating,
    confirmRecalibrationChanges,
    discardRecalibrationChanges,
  } = useNavStore();

  const getLandmarkAnchor = (loc: Landmark): { x: number; z: number } | null => {
    if (typeof loc.x === 'number' && typeof loc.z === 'number') {
      return { x: loc.x, z: loc.z };
    }

    if (
      typeof loc.ax === 'number' &&
      typeof loc.az === 'number' &&
      typeof loc.bx === 'number' &&
      typeof loc.bz === 'number'
    ) {
      return {
        x: (loc.ax + loc.bx) / 2,
        z: (loc.az + loc.bz) / 2,
      };
    }

    return null;
  };

  const navigateToLandmark = (loc: Landmark) => {
    if (typeof loc.node_id !== 'number') {
      return;
    }

    const anchor = getLandmarkAnchor(loc);

    setTarget({
      location_id: loc.node_id,
      node_id: loc.node_id,
      name_th: loc.name_th,
      markerKey: `${loc.node_id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      floor: loc.floor_id,
      x: anchor?.x,
      z: anchor?.z,
    });
  };

const suggestions = useMemo<Landmark[]>(() => {
  const trimmedQuery = query.trim().toLowerCase();
  const searchableLandmarks = LANDMARK_ROWS_DATA.filter(
    (loc) => loc.type.toLowerCase() !== 'hallway'
  );

  if (!trimmedQuery) {
    return searchableLandmarks;
  }

  return searchableLandmarks.filter((loc) =>
    loc.name_th.toLowerCase().includes(trimmedQuery) ||
    loc.name_eng.toLowerCase().includes(trimmedQuery)
  );
}, [query]);

  const handleSelect = (loc: Landmark) => {
    if (isRecalibrating) {
      setPendingSelection(loc);
      return;
    }

    setQuery('');
    setIsFocused(false);
    navigateToLandmark(loc);
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

      {pendingSelection && (
        <div className="fixed inset-0 z-[1300] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => setPendingSelection(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องแจ้งเตือน"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-amber-300 uppercase tracking-wide">
              Recalibrate In Progress
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              พบการเลือกตำแหน่งจาก Search ระหว่าง Recalibrate ต้องการดำเนินการแบบใด?
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  const selected = pendingSelection;
                  setPendingSelection(null);
                  if (!selected) return;
                  confirmRecalibrationChanges();
                  setQuery('');
                  setIsFocused(false);
                  navigateToLandmark(selected);
                }}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors font-bold text-sm text-left"
              >
                1) บันทึกตำแหน่งล่าสุด และไปต่อ
              </button>

              <button
                onClick={() => {
                  const selected = pendingSelection;
                  setPendingSelection(null);
                  if (!selected) return;
                  discardRecalibrationChanges();
                  setQuery('');
                  setIsFocused(false);
                  navigateToLandmark(selected);
                }}
                className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 transition-colors font-bold text-sm text-left"
              >
                2) ไปต่อโดยไม่บันทึก
              </button>

              <button
                onClick={() => {
                  setPendingSelection(null);
                }}
                className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold text-sm text-left"
              >
                3) ปรับตำแหน่งต่อ โดยไม่ไปตำแหน่งใน Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}