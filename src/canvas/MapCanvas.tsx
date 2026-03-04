import { Suspense, useEffect, useMemo, useRef } from 'react';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavStore } from '../store/useNavStore';
import FloorModel from './FloorModel';
import Avatar from './Avatar.jsx';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export default function MapCanvas() {
  const {
    currentFloor,
    userActualFloor,
    cameraMode,
    userPosition,
    avatarType,
    targetLocation,
    setUserPosition,
  } = useNavStore();

  const { gl } = useThree();
  const movingPositionRef = useRef<[number, number, number]>(userPosition);
  const publishAccumulatorRef = useRef(0);
  const followCameraHeightRef = useRef(1.3);

  // Controls ref to dynamically toggle pan/zoom based on gesture classification
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // -----------------------------
  // Avatar Render Condition
  // -----------------------------
  const selectedFloor = userActualFloor ?? targetLocation?.floor ?? null;

  const shouldRenderAvatar =
    selectedFloor !== null &&
    currentFloor === selectedFloor &&
    avatarType !== null;

  useEffect(() => {
    movingPositionRef.current = userPosition;
  }, [userPosition]);

  // -----------------------------
  // Follow Mode Vertical Camera Adjustment
  // -----------------------------
  useEffect(() => {
    if (cameraMode !== 'FOLLOW') return;

    const el = gl.domElement;
    const minHeight = 0.8;
    const maxHeight = 8;
    let activePointerId: number | null = null;
    let lastY = 0;

    const clampHeight = (next: number) =>
      THREE.MathUtils.clamp(next, minHeight, maxHeight);

    const onWheel = (e: WheelEvent) => {
      // scroll up => higher, scroll down => lower
      const next = followCameraHeightRef.current - e.deltaY * 0.005;
      followCameraHeightRef.current = clampHeight(next);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activePointerId !== e.pointerId) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      const next = followCameraHeightRef.current - dy * 0.02;
      followCameraHeightRef.current = clampHeight(next);
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (activePointerId === e.pointerId) {
        activePointerId = null;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerEnd);
    el.addEventListener('pointercancel', onPointerEnd);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerEnd);
      el.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [cameraMode, gl.domElement]);

  const targetWorldPosition = useMemo<[number, number] | null>(() => {
    if (!targetLocation) return null;

    if (
      typeof targetLocation.x === 'number' &&
      typeof targetLocation.z === 'number'
    ) {
      return [targetLocation.x, targetLocation.z];
    }

    if (typeof targetLocation.node_id === 'number') {
      const nodeId = targetLocation.node_id;
      const fallbackX = ((nodeId % 100) - 50) / 5;
      const fallbackZ = (Math.floor(nodeId / 100) - 3) * 4;
      return [fallbackX, fallbackZ];
    }

    return null;
  }, [targetLocation]);

  // -----------------------------
  // Touch Gesture Lock (mutually exclusive pan vs zoom)
  // -----------------------------
  useEffect(() => {
    const el = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    const state = {
      initialDistance: 0,
      lastMid: { x: 0, y: 0 },
      mode: 'idle' as 'idle' | 'pending' | 'pan' | 'zoom',
    };

    const resetControls = () => {
      state.mode = 'idle';
      if (controlsRef.current) {
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
      }
    };

    const calcDistance = () => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return 0;
      const [a, b] = pts;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.hypot(dx, dy);
    };

    const calcMid = () => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return { x: 0, y: 0 };
      const [a, b] = pts;
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        state.initialDistance = calcDistance();
        state.lastMid = calcMid();
        state.mode = 'pending';
        if (controlsRef.current) {
          controlsRef.current.enablePan = true;
          controlsRef.current.enableZoom = true;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const distance = calcDistance();
        const mid = calcMid();
        const distDelta = distance - state.initialDistance;
        const midMove = Math.hypot(mid.x - state.lastMid.x, mid.y - state.lastMid.y);

        // Decide gesture once when pending: zoom dominates distance change, pan dominates translation
        if (state.mode === 'pending') {
          const pinchThreshold = 8;      // how much distance must change to count as pinch
          const panThreshold = 4;        // how much mid-point movement counts as pan
          const pinchNoiseGuard = 10;    // small distance change that we still treat as pan noise

          const distAbs = Math.abs(distDelta);
          const pinchDominates = distAbs > pinchThreshold && distAbs > midMove * 1.3;

          if (pinchDominates) {
            state.mode = 'zoom';
            if (controlsRef.current) {
              controlsRef.current.enableZoom = true;
              controlsRef.current.enablePan = false;
            }
          } else if (
            midMove > panThreshold ||
            (midMove > 0 && distAbs <= pinchNoiseGuard)
          ) {
            // Allow small pinch drift to still register as pan
            state.mode = 'pan';
            if (controlsRef.current) {
              controlsRef.current.enablePan = true;
              controlsRef.current.enableZoom = false;
            }
          }
        }

        // Maintain locks during gesture
        if (state.mode === 'zoom') {
          if (controlsRef.current) {
            controlsRef.current.enableZoom = true;
            controlsRef.current.enablePan = false;
          }
        } else if (state.mode === 'pan') {
          if (controlsRef.current) {
            controlsRef.current.enablePan = true;
            controlsRef.current.enableZoom = false;
          }
        }

        state.lastMid = mid;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) {
        resetControls();
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      resetControls();
    };
  }, [gl.domElement]);

  // -----------------------------
  // Camera Follow Logic
  // -----------------------------
  useFrame((state, delta) => {
    if (cameraMode !== 'FOLLOW') return;
    if (!shouldRenderAvatar) return;

    let nextPosition: [number, number, number] = movingPositionRef.current;

    if (targetWorldPosition) {
      const [tx, tz] = targetWorldPosition;
      const dx = tx - nextPosition[0];
      const dz = tz - nextPosition[2];
      const distance = Math.hypot(dx, dz);

      const arrivalThreshold = 0.05;
      if (distance > arrivalThreshold) {
        const moveSpeed = 0.35;
        const step = Math.min(moveSpeed * delta, distance);
        const nx = nextPosition[0] + (dx / distance) * step;
        const nz = nextPosition[2] + (dz / distance) * step;
        nextPosition = [nx, 0, nz];
        movingPositionRef.current = nextPosition;
      }
    }

    publishAccumulatorRef.current += delta;
    const publishStep = 1 / 30;
    if (publishAccumulatorRef.current >= publishStep) {
      publishAccumulatorRef.current = 0;
      setUserPosition(movingPositionRef.current);
    }

    const radius = 3.2;
    const targetY = followCameraHeightRef.current;

    const targetX = nextPosition[0];
    const targetZ = nextPosition[2] - radius;

    state.camera.position.set(targetX, targetY, targetZ);
    state.camera.lookAt(nextPosition[0], 1.2, nextPosition[2]);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1.5} />
      <Environment preset="city" />

      {/* Default Camera */}
      <PerspectiveCamera
        makeDefault
        position={[15, 15, 15]}
        fov={45}
      />

      {/* Free Mode Controls */}
      {cameraMode === 'FREE' && (
        <OrbitControls
          ref={controlsRef}
          key="free-mode"
          domElement={gl.domElement}
          makeDefault
          enableDamping
          // Gestures: 1-finger rotate, 2-finger drag pan, 2-finger pinch zoom
          enablePan
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          target={[userPosition[0], 1, userPosition[2]]}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0}
        />
      )}

      <Suspense fallback={null}>
        {/* Floor Model (ยกเล็กน้อยตามที่กำหนด) */}
        <group position={[0, -0.08, 0]}>
          <FloorModel floor={currentFloor} />
        </group>

        {/* Avatar render เฉพาะตอน floor ตรงกัน */}
        {shouldRenderAvatar && <Avatar />}
      </Suspense>

      {/* Shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={30}
        blur={2}
      />
    </>
  );
}
