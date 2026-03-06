import React, { Suspense, useEffect, useRef } from 'react';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavStore } from '../store/useNavStore';
import FloorModel from './FloorModel';
import Avatar from './Avatar';
import * as THREE from 'three';

export default function MapCanvas() {
  const {
    currentFloor,
    userActualFloor,
    cameraMode,
    userPosition,
    avatarType,
  } = useNavStore();

  const { gl } = useThree();

  const gyro = useRef({ alpha: 0, initial: null as number | null });

  // ✅ ตรวจว่าควร render avatar ไหม
  const shouldRenderAvatar = currentFloor === userActualFloor && avatarType !== null;

  // -----------------------------
  // Device Orientation
  // -----------------------------
  useEffect(() => {
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (
        (cameraMode === 'GYRO' || cameraMode === 'FOLLOW') &&
        e.alpha !== null
      ) {
        if (gyro.current.initial === null) {
          gyro.current.initial = e.alpha;
        }

        const diff = e.alpha - gyro.current.initial;
        gyro.current.alpha = THREE.MathUtils.degToRad(diff);
      }
    };

    if (cameraMode === 'GYRO' || cameraMode === 'FOLLOW') {
      window.addEventListener('deviceorientation', onOrientation, true);
    } else {
      gyro.current.initial = null;
    }

    return () =>
      window.removeEventListener('deviceorientation', onOrientation);
  }, [cameraMode]);

  // -----------------------------
  // Camera Follow Logic
  // -----------------------------
  useFrame((state) => {
    if (
      cameraMode !== 'GYRO' &&
      cameraMode !== 'FOLLOW'
    )
      return;

    // ❗ ถ้า avatar ไม่ได้ render → ไม่ต้อง follow
    if (!shouldRenderAvatar) return;

    const radius = 3.2;
    const targetY = 1.3;
    const smoothing = 0.1;

    const targetX =
      userPosition[0] - Math.sin(gyro.current.alpha) * radius;
    const targetZ =
      userPosition[2] - Math.cos(gyro.current.alpha) * radius;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetX,
      smoothing
    );

    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      smoothing
    );

    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY,
      smoothing
    );

    state.camera.lookAt(userPosition[0], 1.2, userPosition[2]);
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <Environment preset="city" />

      <PerspectiveCamera
        makeDefault
        position={[15, 15, 15]}
        fov={45}
      />

      {cameraMode === 'FREE' && (
        <OrbitControls
          key="free-mode"
          domElement={gl.domElement}
          makeDefault
          enableDamping
          target={[userPosition[0], 1, userPosition[2]]}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0}
        />
      )}

      <Suspense fallback={null}>
        {/* Floor render ตาม UI */}
        <group position={[0, -0.08, 0]}>
        <FloorModel floor={currentFloor} /></group>

        {/* Avatar render เฉพาะตอน floor ตรง */}
        {shouldRenderAvatar && <Avatar />}
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={30}
        blur={2}
      />
    </>
  );
}