import { useEffect, useMemo, useRef, useState } from 'react';
import SearchBox from './SearchBox';
import FloorSelector from './FloorSelector';
import SetupModals from './SetupModals'; 
import { useNavStore } from '../store/useNavStore';
import { computeFlowAPath } from '../core/pathfindingFlowA';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';
   // ตรวจสอบพิกัดเป้าหมายที่เลือกจาก SearchBox

const ENABLE_DEBUG_COORDINATE_PANEL = true;
const FLOW_B_NEAR_CONNECTOR_DISTANCE = 0.9;
const FLOW_B_NEAR_CONNECTOR_HOLD_MS = 3000;

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

interface FlowBConnectorTarget {
  connectorType: 'elevator' | 'stair';
  floor: number;
  nodeId?: number | null;
  x: number;
  z: number;
}

interface FlowAStartPoint {
  x: number;
  z: number;
}

type ConnectorType = 'elevator' | 'stair';

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
    setCameraMode,
    userPosition,
    rawGpsPosition,
    targetLocation,
    currentFloor,
    userActualFloor,
    currentFloorMetrics,
    lastMapClickPoint,
    navigationRoutePoints,
    setNavigationPinLocation,
    setNavigationRoutePoints,
    clearNavigationRoute,
    setFloor,
    setUserActualFloor,
  } = useNavStore();
  const [showStartNavigationConfirm, setShowStartNavigationConfirm] = useState(false);
  const [showCancelNavigationConfirm, setShowCancelNavigationConfirm] = useState(false);
  const [showTransportChoiceConfirm, setShowTransportChoiceConfirm] = useState(false);
  const [showFlowBFloorChangedConfirm, setShowFlowBFloorChangedConfirm] = useState(false);
  const [showFlowBFloorPicker, setShowFlowBFloorPicker] = useState(false);
  const [flowBConnectorTarget, setFlowBConnectorTarget] = useState<FlowBConnectorTarget | null>(null);

  const flowBNearTimerRef = useRef<number | null>(null);
  const flowBPromptArmedRef = useRef(true);
  const flowBMarkerCounterRef = useRef(0);

  const [userX, , userZ] = userPosition;
  const rawLat = rawGpsPosition?.[0];
  const rawLng = rawGpsPosition?.[1];

  const hasStartedNavigation = navigationRoutePoints.length >= 2;

  useEffect(() => {
    return () => {
      if (flowBNearTimerRef.current !== null) {
        window.clearTimeout(flowBNearTimerRef.current);
        flowBNearTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const connector = flowBConnectorTarget;
    if (!connector) {
      if (flowBNearTimerRef.current !== null) {
        window.clearTimeout(flowBNearTimerRef.current);
        flowBNearTimerRef.current = null;
      }
      flowBPromptArmedRef.current = true;
      return;
    }

    const dx = userX - connector.x;
    const dz = userZ - connector.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const isNear = distance <= FLOW_B_NEAR_CONNECTOR_DISTANCE;

    if (!isNear) {
      if (flowBNearTimerRef.current !== null) {
        window.clearTimeout(flowBNearTimerRef.current);
        flowBNearTimerRef.current = null;
      }
      flowBPromptArmedRef.current = true;
      return;
    }

    if (
      flowBPromptArmedRef.current &&
      flowBNearTimerRef.current === null &&
      !showFlowBFloorChangedConfirm &&
      !showFlowBFloorPicker
    ) {
      flowBNearTimerRef.current = window.setTimeout(() => {
        setShowFlowBFloorChangedConfirm(true);
        flowBPromptArmedRef.current = false;
        flowBNearTimerRef.current = null;
      }, FLOW_B_NEAR_CONNECTOR_HOLD_MS);
    }
  }, [flowBConnectorTarget, showFlowBFloorChangedConfirm, showFlowBFloorPicker, userX, userZ]);

  const getRowAnchor = (row: LandmarkRow): { x: number; z: number } | null => {
    if (Number.isFinite(row.x) && Number.isFinite(row.z)) {
      return { x: row.x as number, z: row.z as number };
    }

    if (
      Number.isFinite(row.ax) &&
      Number.isFinite(row.az) &&
      Number.isFinite(row.bx) &&
      Number.isFinite(row.bz)
    ) {
      return {
        x: ((row.ax as number) + (row.bx as number)) / 2,
        z: ((row.az as number) + (row.bz as number)) / 2,
      };
    }

    return null;
  };

  const runFlowAToDestination = (
    destination: { floor_id: number; node_id?: number | null; x?: number; z?: number },
    sourceFloor: number = currentFloor,
    startPoint?: FlowAStartPoint
  ) => {
    setNavigationPinLocation(null);

    const result = computeFlowAPath({
      currentPosition: {
        x: startPoint?.x ?? userX,
        z: startPoint?.z ?? userZ,
      },
      currentFloor: sourceFloor,
      destination,
    });

    if (result.ok) {
      const routePoints = result.points.map((point) => [point.x, 0.12, point.z] as [number, number, number]);
      setNavigationRoutePoints(routePoints);
      setCameraMode('FOLLOW');
      return true;
    }

    clearNavigationRoute();
    console.warn('[navigation] Flow A route failed:', result.reason);
    return false;
  };

  const startFlowBToNearestConnector = (
    connectorType: ConnectorType | 'any' = 'any',
    sourceFloor: number = currentFloor,
    startPoint?: FlowAStartPoint
  ) => {
    const rows = LANDMARK_ROWS_DATA as LandmarkRow[];
    const connectors = rows.filter(
      (row) => {
        if (row.floor_id !== sourceFloor) return false;
        const rowType = String(row.type).toLowerCase();
        if (connectorType === 'any') {
          return rowType === 'elevator' || rowType === 'stair';
        }
        return rowType === connectorType;
      }
    );

    let nearestRow: LandmarkRow | null = null;
    let nearestAnchor: { x: number; z: number } | null = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;

    for (const row of connectors) {
      const anchor = getRowAnchor(row);
      if (!anchor) continue;

      const startX = startPoint?.x ?? userX;
      const startZ = startPoint?.z ?? userZ;
      const dx = startX - anchor.x;
      const dz = startZ - anchor.z;
      const distanceSq = dx * dx + dz * dz;

      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestRow = row;
        nearestAnchor = anchor;
      }
    }

    if (!nearestRow || !nearestAnchor) {
      console.warn(`[navigation] No ${connectorType} connector found on floor ${sourceFloor}`);
      return;
    }

    const nearestTypeRaw = String(nearestRow.type).toLowerCase();
    const resolvedConnectorType: ConnectorType = nearestTypeRaw === 'stair' ? 'stair' : 'elevator';

    runFlowAToDestination({
      floor_id: sourceFloor,
      node_id: nearestRow.node_id ?? null,
      x: nearestAnchor.x,
      z: nearestAnchor.z,
    }, sourceFloor, startPoint);

    setNavigationPinLocation({
      location_id: nearestRow.node_id ?? undefined,
      node_id: nearestRow.node_id ?? undefined,
      name_th: nearestRow.name_th,
      floor: sourceFloor,
      x: nearestAnchor.x,
      z: nearestAnchor.z,
      markerKey: `connector-${resolvedConnectorType}-${nearestRow.node_id ?? 'unknown'}-${++flowBMarkerCounterRef.current}`,
    });

    setFlowBConnectorTarget({
      connectorType: resolvedConnectorType,
      floor: sourceFloor,
      nodeId: nearestRow.node_id ?? null,
      x: nearestAnchor.x,
      z: nearestAnchor.z,
    });

    setShowFlowBFloorChangedConfirm(false);
    setShowFlowBFloorPicker(false);
    flowBPromptArmedRef.current = true;
    if (flowBNearTimerRef.current !== null) {
      window.clearTimeout(flowBNearTimerRef.current);
      flowBNearTimerRef.current = null;
    }
  };

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

      {ENABLE_DEBUG_COORDINATE_PANEL && (
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
      )}

      <div className="flex justify-center w-full pointer-events-auto">
        <SearchBox />
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-[1001]">
        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm text-xs font-bold shadow-lg">
          ตำแหน่งปัจจุบัน: {currentNodeName}
        </div>
      </div>

      {targetLocation && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto z-[1002]">
          <button
            onClick={() => {
              if (hasStartedNavigation) {
                setShowCancelNavigationConfirm(true);
                return;
              }

              setShowStartNavigationConfirm(true);
            }}
            className={`px-5 py-3 rounded-2xl border-2 shadow-xl font-black text-sm transition-all active:scale-95 ${
              hasStartedNavigation
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-blue-600 border-blue-400 text-white'
            }`}
          >
            {hasStartedNavigation ? 'กำลังนำทาง' : 'เริ่มนำทาง'}
          </button>
        </div>
      )}

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
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <div className="flex flex-col gap-2 items-center">
            <div className="bg-black/90 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-sm uppercase">
              {cameraMode}
            </div>
            <button 
              onClick={() => cycleCameraMode()}
              className="w-16 h-16 bg-white rounded-2xl border-2 border-slate-200 shadow-xl flex items-center justify-center text-3xl active:scale-90 transition-transform"
            >
              {cameraMode === 'FOLLOW' ? '🎥' : '📷'}
            </button>
          </div>

          <FloorSelector />
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

      {showStartNavigationConfirm && targetLocation && (
        <div className="fixed inset-0 z-[1400] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => setShowStartNavigationConfirm(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องยืนยันเริ่มนำทาง"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-sky-300 uppercase tracking-wide">
              Start Navigation
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              ต้องการเริ่มนำทางไปยัง {targetLocation.name_th ?? 'ปลายทางที่เลือก'} หรือไม่?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowStartNavigationConfirm(false)}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowStartNavigationConfirm(false);

                  const targetFloor = targetLocation.floor ?? currentFloor;
                  const userFloor = userActualFloor ?? currentFloor;

                  if (targetFloor !== userFloor) {
                    setFlowBConnectorTarget(null);
                    setFloor(userFloor);
                    setCameraMode('FOLLOW');
                    startFlowBToNearestConnector('any', userFloor);
                    return;
                  }

                  setFlowBConnectorTarget(null);
                  setShowFlowBFloorChangedConfirm(false);
                  setShowFlowBFloorPicker(false);
                  flowBPromptArmedRef.current = true;
                  if (flowBNearTimerRef.current !== null) {
                    window.clearTimeout(flowBNearTimerRef.current);
                    flowBNearTimerRef.current = null;
                  }

                  runFlowAToDestination({
                    floor_id: userFloor,
                    node_id: targetLocation.node_id ?? null,
                    x: targetLocation.x,
                    z: targetLocation.z,
                  });
                }}
                className="py-2 rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors font-bold text-sm"
              >
                เริ่มนำทาง
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelNavigationConfirm && targetLocation && (
        <div className="fixed inset-0 z-[1401] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => setShowCancelNavigationConfirm(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องยืนยันยกเลิกนำทาง"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-rose-300 uppercase tracking-wide">
              Cancel Navigation
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              ต้องการยกเลิกการนำทางไปยัง {targetLocation.name_th ?? 'ปลายทางที่เลือก'} หรือไม่?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCancelNavigationConfirm(false)}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold text-sm"
              >
                ไม่ยกเลิก
              </button>
              <button
                onClick={() => {
                  clearNavigationRoute();
                  setFlowBConnectorTarget(null);
                  setShowFlowBFloorChangedConfirm(false);
                  setShowFlowBFloorPicker(false);
                  flowBPromptArmedRef.current = true;
                  if (flowBNearTimerRef.current !== null) {
                    window.clearTimeout(flowBNearTimerRef.current);
                    flowBNearTimerRef.current = null;
                  }
                  setShowCancelNavigationConfirm(false);
                }}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 transition-colors font-bold text-sm"
              >
                ยกเลิกนำทาง
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransportChoiceConfirm && targetLocation && (
        <div className="fixed inset-0 z-[1402] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => setShowTransportChoiceConfirm(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องเลือกวิธีเปลี่ยนชั้น"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-cyan-300 uppercase tracking-wide">
              Choose Transport
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              ปลายทางอยู่คนละชั้น ต้องการไปด้วยลิฟต์หรือบันได?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowTransportChoiceConfirm(false);
                  startFlowBToNearestConnector('elevator');
                }}
                className="py-2 rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors font-bold text-sm"
              >
                ไปทางลิฟต์
              </button>
              <button
                onClick={() => {
                  setShowTransportChoiceConfirm(false);
                  startFlowBToNearestConnector('stair');
                }}
                className="py-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition-colors font-bold text-sm"
              >
                ไปทางบันได
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowBFloorChangedConfirm && flowBConnectorTarget && (
        <div className="fixed inset-0 z-[1403] pointer-events-auto flex items-center justify-center p-6">
          <button
            onClick={() => {
              setShowFlowBFloorChangedConfirm(false);
              flowBPromptArmedRef.current = false;
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องยืนยันการเปลี่ยนชั้น"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl text-white p-5">
            <div className="text-sm font-black text-lime-300 uppercase tracking-wide">
              Floor Changed?
            </div>
            <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              คุณอยู่ใกล้{flowBConnectorTarget.connectorType === 'elevator' ? 'ลิฟต์' : 'บันได'}แล้ว ได้เปลี่ยนชั้นที่อยู่หรือยัง?
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowFlowBFloorChangedConfirm(false);
                  flowBPromptArmedRef.current = false;
                }}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-bold text-sm"
              >
                ยัง
              </button>
              <button
                onClick={() => {
                  setShowFlowBFloorChangedConfirm(false);
                  setShowFlowBFloorPicker(true);
                }}
                className="py-2 rounded-xl bg-lime-600 hover:bg-lime-500 transition-colors font-bold text-sm"
              >
                ใช่
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowBFloorPicker && flowBConnectorTarget && (
        <div className="fixed inset-0 z-[1404] pointer-events-auto flex items-center justify-center p-4">
          <button
            onClick={() => setShowFlowBFloorPicker(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="ปิดกล่องเลือกชั้น"
          />

          <div className="relative bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-bold text-[#2A3547] mb-1">ตอนนี้คุณอยู่ชั้นไหน?</h2>
            <p className="text-sm text-[#8A98A8] mb-6 text-center">เลือกชั้นปัจจุบันหลังเปลี่ยนชั้นแล้ว (ไม่เปลี่ยนพิกัด user)</p>

            <div className="grid grid-cols-3 gap-3 w-full mb-8">
              {[1, 2, 3, 4, 5, 6].map((floor) => (
                <button
                  key={floor}
                  onClick={() => {
                    const targetFloor = targetLocation?.floor;
                    const selectedFloor = floor;

                    setUserActualFloor(floor);
                    setFloor(floor);
                    setShowFlowBFloorPicker(false);
                    setShowFlowBFloorChangedConfirm(false);
                    flowBPromptArmedRef.current = true;
                    if (flowBNearTimerRef.current !== null) {
                      window.clearTimeout(flowBNearTimerRef.current);
                      flowBNearTimerRef.current = null;
                    }

                    if (!targetLocation || typeof targetFloor !== 'number') {
                      clearNavigationRoute();
                      setFlowBConnectorTarget(null);
                      return;
                    }

                    if (selectedFloor === targetFloor) {
                      const continuationStart = {
                        x: flowBConnectorTarget.x,
                        z: flowBConnectorTarget.z,
                      };

                      setFlowBConnectorTarget(null);
                      runFlowAToDestination(
                        {
                          floor_id: selectedFloor,
                          node_id: targetLocation.node_id ?? null,
                          x: targetLocation.x,
                          z: targetLocation.z,
                        },
                        selectedFloor,
                        continuationStart
                      );
                      return;
                    }

                    const continuationStart = {
                      x: flowBConnectorTarget.x,
                      z: flowBConnectorTarget.z,
                    };

                    startFlowBToNearestConnector('any', selectedFloor, continuationStart);
                  }}
                  className="py-3 px-2 bg-white border border-[#E2E8F0] rounded-2xl text-[#2A3547] font-bold hover:bg-slate-50 hover:border-[#CBD5E1] transition-all active:scale-95 shadow-sm"
                >
                  ชั้น {floor}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFlowBFloorPicker(false)}
              className="text-[#FF5252] font-bold hover:text-red-600 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}