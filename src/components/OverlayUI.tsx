import { useMemo } from 'react';
import SearchBox from './SearchBox';
import FloorSelector from './FloorSelector';
import SetupModals from './SetupModals'; 
import { useNavStore } from '../store/useNavStore';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';
   // ตรวจสอบพิกัดเป้าหมายที่เลือกจาก SearchBox

interface LandmarkRow {
  node_id?: number | null;
  floor_id: number;
  name_th?: string;
  type?: string;
  x?: number | null;
  z?: number | null;
  ax?: number | null;
  az?: number | null;
  bx?: number | null;
  bz?: number | null;
}

export default function OverlayUI() {
  const {
    isFollowing,
    toggleFollowing,
    isRecalibrating,
    toggleRecalibrateMode,
    showRecalibrationExitConfirm,
    cancelRecalibrationExitConfirm,
    confirmRecalibrationChanges,
    discardRecalibrationChanges,
    cameraMode,
    cycleCameraMode,
    userPosition,
    rawGpsPosition,
    currentFloor,
    currentFloorMetrics,
    lastMapClickPoint,
  } = useNavStore();

  const [userX, , userZ] = userPosition;
  const rawLat = rawGpsPosition?.[0];
  const rawLng = rawGpsPosition?.[1];

  const currentNodeName = useMemo(() => {
    const rows = LANDMARK_ROWS_DATA as LandmarkRow[];
    const floorRows = rows.filter((row) => row.floor_id === currentFloor);

    if (floorRows.length === 0) {
      return '-';
    }

    const pointDistanceSq = (x: number, z: number) => {
      const dx = userX - x;
      const dz = userZ - z;
      return dx * dx + dz * dz;
    };

    const segmentDistanceSq = (
      x1: number,
      z1: number,
      x2: number,
      z2: number
    ) => {
      const vx = x2 - x1;
      const vz = z2 - z1;
      const wx = userX - x1;
      const wz = userZ - z1;
      const lenSq = vx * vx + vz * vz;

      if (lenSq <= 0.000001) {
        return pointDistanceSq(x1, z1);
      }

      const t = Math.max(0, Math.min(1, (wx * vx + wz * vz) / lenSq));
      const px = x1 + t * vx;
      const pz = z1 + t * vz;
      return pointDistanceSq(px, pz);
    };

    let nearestName = '-';
    let nearestDistanceSq = Number.POSITIVE_INFINITY;

    for (const row of floorRows) {
      let candidateDistanceSq = Number.POSITIVE_INFINITY;

      if (Number.isFinite(row.x) && Number.isFinite(row.z)) {
        candidateDistanceSq = pointDistanceSq(row.x as number, row.z as number);
      } else if (
        Number.isFinite(row.ax) &&
        Number.isFinite(row.az) &&
        Number.isFinite(row.bx) &&
        Number.isFinite(row.bz)
      ) {
        candidateDistanceSq = segmentDistanceSq(
          row.ax as number,
          row.az as number,
          row.bx as number,
          row.bz as number
        );
      }

      if (candidateDistanceSq < nearestDistanceSq) {
        nearestDistanceSq = candidateDistanceSq;
        nearestName = row.name_th?.trim() || '-';
      }
    }

    return nearestName;
  }, [currentFloor, userX, userZ]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] p-6 flex flex-col justify-between">
      <SetupModals />

      <div className="absolute top-6 right-6 pointer-events-none z-[1001]">
        <div className="bg-black/90 px-3 py-2 rounded-xl text-xs text-white font-bold backdrop-blur-sm">
          <div className="text-[10px] text-blue-300">1. RAW LAT/LNG</div>
          <div>Lat: {rawLat !== undefined ? rawLat.toFixed(6) : '-'}</div>
          <div>Lng: {rawLng !== undefined ? rawLng.toFixed(6) : '-'}</div>

          <div className="mt-2 text-[10px] text-amber-300">2. AVATAR POSITION (X/Z)</div>
          <div>X: {userX.toFixed(2)}</div>
          <div>Z: {userZ.toFixed(2)}</div>

          <div className="mt-2 text-[10px] text-fuchsia-300">3. FLOOR SIZE (X/Z)</div>
          <div>
            X: {currentFloorMetrics?.floor === currentFloor ? currentFloorMetrics.width.toFixed(2) : '-'}
          </div>
          <div>
            Z: {currentFloorMetrics?.floor === currentFloor ? currentFloorMetrics.depth.toFixed(2) : '-'}
          </div>

          <div className="mt-2 text-[10px] text-cyan-300">4. MAP CLICK (3D)</div>
          <div>
            {lastMapClickPoint
              ? `📍 พิกัด 3D -> X: ${lastMapClickPoint.x.toFixed(2)}, Z: ${lastMapClickPoint.z.toFixed(2)} (ชั้น ${lastMapClickPoint.floor})`
              : 'ยังไม่ได้คลิกบนแผนที่'}
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full pointer-events-auto">
        <SearchBox />
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-[1001]">
        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm text-xs font-bold shadow-lg">
          ตำแหน่งปัจจุบัน: {currentNodeName}
        </div>
      </div>

      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col gap-3 pointer-events-auto">
          {/* ปุ่ม GPS (ซ้ายล่าง) */}
          <button 
            onClick={() => toggleFollowing()}
            className={`w-14 h-14 rounded-2xl shadow-xl transition-all active:scale-95 border-2 font-black text-[10px] flex flex-col items-center justify-center leading-tight ${
              isFollowing 
                ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-lg">{isFollowing ? '📡' : '📍'}</span>
            <span>GPS</span>
          </button>

          {/* ปุ่ม Recalibrate (toggle) */}
          <button
            onClick={() => toggleRecalibrateMode()}
            className={`w-14 h-14 rounded-2xl shadow-xl transition-all active:scale-95 border-2 font-black text-[10px] flex flex-col items-center justify-center leading-tight ${
              isRecalibrating
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-lg">🛠️</span>
            <span>CAL</span>
          </button>
        </div>

        {/* ปุ่ม Mode & Floor (ขวาล่าง) */}
        <div className="flex flex-row items-end gap-4">
          <div className="flex flex-col gap-2 items-center">
            <div className="bg-black/90 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-sm uppercase">
              {cameraMode}
            </div>
            <button 
              onClick={() => cycleCameraMode()}
              className="w-16 h-16 bg-white rounded-2xl border-2 border-slate-200 shadow-xl pointer-events-auto flex items-center justify-center text-3xl active:scale-90 transition-transform"
            >
              {cameraMode === 'FOLLOW' ? '🎥' : '📷'}
            </button>
          </div>
          <div className="pointer-events-auto">
            <FloorSelector />
          </div>
        </div>
      </div>

      {showRecalibrationExitConfirm && (
        <div className="fixed inset-0 z-[1300] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => cancelRecalibrationExitConfirm()}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องแจ้งเตือน"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-amber-300 uppercase tracking-wide">
              Recalibrate Changed
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              พบการเปลี่ยนตำแหน่งในโหมด Recalibrate ต้องการบันทึกตำแหน่งล่าสุดก่อนปิดหรือไม่?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => confirmRecalibrationChanges()}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors font-bold text-sm"
              >
                บันทึกแล้วปิด
              </button>
              <button
                onClick={() => discardRecalibrationChanges()}
                className="py-2 rounded-xl bg-orange-600 hover:bg-orange-500 transition-colors font-bold text-sm"
              >
                ไม่บันทึกแล้วปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}