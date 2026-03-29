import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import * as THREE from 'three';
import { useNavStore } from '../store/useNavStore';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';

const MODEL_SCALE = 0.1;
const RECALIBRATE_MOVE_COOLDOWN_MS = 500;
const RECALIBRATE_IDLE_SNAP_MS = 1500;
const SNAP_POSITION_EPSILON = 0.001;

// If your GLB is already Y-up on XZ plane, keep this at 0.
// If exported as Z-up (common in some DCC tools), set to -Math.PI / 2.
const MODEL_ROTATION_X = 0;

// Map north calibration (yaw around Y axis).
// Example: THREE.MathUtils.degToRad(12) to rotate 12 degrees.
const MODEL_YAW_OFFSET = 0;

export interface FloorRenderMetrics {
  width: number;
  depth: number;
  area: number;
  scale: number;
}

interface FloorModelProps {
  floor: number;
  onMetricsComputed?: (metrics: FloorRenderMetrics) => void;
}

interface LandmarkRow {
  node_id?: number | null;
  floor_id?: number;
  type?: string;
  x?: number | null;
  z?: number | null;
  ax?: number | null;
  az?: number | null;
  bx?: number | null;
  bz?: number | null;
}

interface SnapCandidate {
  x: number;
  z: number;
  distanceSq: number;
}

export default function FloorModel({ floor, onMetricsComputed }: FloorModelProps) {
  const { scene } = useGLTF(`/models/archif${floor}.glb`);
  const setLastMapClickPoint = useNavStore((state) => state.setLastMapClickPoint);
  const setUserPosition = useNavStore((state) => state.setUserPosition);
  const isRecalibrating = useNavStore((state) => state.isRecalibrating);
  const userPosition = useNavStore((state) => state.userPosition);
  const pendingSnapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClickPositionRef = useRef<[number, number, number] | null>(null);
  const lastRecalibrateChangeAtRef = useRef(0);
  const isRecalibratingRef = useRef(isRecalibrating);
  const userPositionRef = useRef(userPosition);

  useEffect(() => {
    isRecalibratingRef.current = isRecalibrating;
  }, [isRecalibrating]);

  useEffect(() => {
    userPositionRef.current = userPosition;
  }, [userPosition]);

  const floorRows = useMemo(() => {
    const rows = LANDMARK_ROWS_DATA as LandmarkRow[];
    return rows.filter((row) => row.floor_id === floor);
  }, [floor]);

  const findNearestCandidate = (x: number, z: number): SnapCandidate | null => {
    if (floorRows.length === 0) {
      return null;
    }

    const pointDistanceSq = (px: number, pz: number) => {
      const dx = x - px;
      const dz = z - pz;
      return dx * dx + dz * dz;
    };

    const getNearestPointOnSegment = (
      ax: number,
      az: number,
      bx: number,
      bz: number
    ): SnapCandidate => {
      const vx = bx - ax;
      const vz = bz - az;
      const lenSq = vx * vx + vz * vz;

      if (lenSq <= 0.000001) {
        return {
          x: ax,
          z: az,
          distanceSq: pointDistanceSq(ax, az),
        };
      }

      const t = ((x - ax) * vx + (z - az) * vz) / lenSq;
      const clampedT = Math.max(0, Math.min(1, t));
      const nearestX = ax + clampedT * vx;
      const nearestZ = az + clampedT * vz;

      return {
        x: nearestX,
        z: nearestZ,
        distanceSq: pointDistanceSq(nearestX, nearestZ),
      };
    };

    let nearest: SnapCandidate | null = null;
    let minDistanceSq = Number.POSITIVE_INFINITY;

    for (const row of floorRows) {
      let candidate: SnapCandidate | null = null;

      if (
        String(row.type).toLowerCase() === 'hallway' &&
        Number.isFinite(row.ax) &&
        Number.isFinite(row.az) &&
        Number.isFinite(row.bx) &&
        Number.isFinite(row.bz)
      ) {
        candidate = getNearestPointOnSegment(
          row.ax as number,
          row.az as number,
          row.bx as number,
          row.bz as number
        );
      } else if (Number.isFinite(row.x) && Number.isFinite(row.z)) {
        candidate = {
          x: row.x as number,
          z: row.z as number,
          distanceSq: pointDistanceSq(row.x as number, row.z as number),
        };
      }

      if (!candidate) {
        continue;
      }

      if (candidate.distanceSq < minDistanceSq) {
        minDistanceSq = candidate.distanceSq;
        nearest = candidate;
      }
    }

    return nearest;
  };

  useEffect(() => {
    if (isRecalibrating) {
      return;
    }

    if (pendingSnapTimerRef.current) {
      clearTimeout(pendingSnapTimerRef.current);
      pendingSnapTimerRef.current = null;
    }
    pendingClickPositionRef.current = null;
  }, [isRecalibrating]);

  useEffect(() => {
    return () => {
      if (pendingSnapTimerRef.current) {
        clearTimeout(pendingSnapTimerRef.current);
      }
    };
  }, []);

  const { model, offset, metrics } = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const tempRoot = new THREE.Group();
    tempRoot.add(cloned);
    tempRoot.scale.setScalar(MODEL_SCALE);

    // Measure scaled planar footprint before yaw rotation for stable size readout.
    tempRoot.rotation.set(0, 0, 0);
    tempRoot.updateMatrixWorld(true);
    const planarBox = new THREE.Box3().setFromObject(tempRoot);
    const planarSize = planarBox.getSize(new THREE.Vector3());

    tempRoot.rotation.set(MODEL_ROTATION_X, MODEL_YAW_OFFSET, 0);
    tempRoot.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(tempRoot);
    const center = box.getCenter(new THREE.Vector3());
    const minY = box.min.y;

    return {
      model: cloned,
      offset: new THREE.Vector3(-center.x, -minY, -center.z),
      metrics: {
        width: planarSize.x,
        depth: planarSize.z,
        area: planarSize.x * planarSize.z,
        scale: MODEL_SCALE,
      },
    };
  }, [scene]);

  useEffect(() => {
    if (!onMetricsComputed) return;
    onMetricsComputed(metrics);
  }, [metrics, onMetricsComputed]);

  return (
      <group
        scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}
        rotation={[MODEL_ROTATION_X, MODEL_YAW_OFFSET, 0]}
        position={[offset.x, offset.y, offset.z]}
        // 👇 เพิ่ม onClick สำหรับหาพิกัดและบอกชั้น 👇
        onClick={(e) => {
          e.stopPropagation();
          const clickPoint = {
            x: e.point.x,
            z: e.point.z,
            floor,
          };
          setLastMapClickPoint(clickPoint);

          if (isRecalibrating) {
            const now = Date.now();
            if (now - lastRecalibrateChangeAtRef.current < RECALIBRATE_MOVE_COOLDOWN_MS) {
              return;
            }

            const clickedPosition: [number, number, number] = [clickPoint.x, 0, clickPoint.z];
            setUserPosition(clickedPosition);
            lastRecalibrateChangeAtRef.current = now;
            pendingClickPositionRef.current = clickedPosition;

            if (pendingSnapTimerRef.current) {
              clearTimeout(pendingSnapTimerRef.current);
            }

            pendingSnapTimerRef.current = setTimeout(() => {
              if (!isRecalibratingRef.current) return;

              const pending = pendingClickPositionRef.current;
              if (!pending) return;

              const latestPosition = userPositionRef.current;

              const unchangedSinceClick =
                Math.abs(latestPosition[0] - pending[0]) < SNAP_POSITION_EPSILON &&
                Math.abs(latestPosition[2] - pending[2]) < SNAP_POSITION_EPSILON;

              if (!unchangedSinceClick) {
                return;
              }

              const nearest = findNearestCandidate(pending[0], pending[2]);
              if (!nearest) {
                return;
              }

              setUserPosition([nearest.x, 0, nearest.z]);
              lastRecalibrateChangeAtRef.current = Date.now();
            }, RECALIBRATE_IDLE_SNAP_MS);
          }

          console.log(`📍 พิกัด 3D -> X: ${clickPoint.x.toFixed(2)}, Z: ${clickPoint.z.toFixed(2)} (ชั้น ${clickPoint.floor})`);
        }}
      >
        <primitive object={model} />
      </group>
    );
}