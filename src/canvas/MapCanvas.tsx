import React, { Suspense, useEffect, useRef } from 'react';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavStore } from '../store/useNavStore';
import FloorModel from './FloorModel'; 
import Avatar from './Avatar';         
import * as THREE from 'three';

export default function MapCanvas() {
  const { currentFloor, cameraMode, userPosition } = useNavStore();
  const { gl } = useThree();
  
  const gyro = useRef({ alpha: 0, initial: null as number | null });

  useEffect(() => {
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (cameraMode === 'GYRO' && e.alpha !== null) {
        if (gyro.current.initial === null) gyro.current.initial = e.alpha;
        const diff = e.alpha - gyro.current.initial;
        gyro.current.alpha = THREE.MathUtils.degToRad(diff);
      }
    };
    if (cameraMode === 'GYRO') window.addEventListener('deviceorientation', onOrientation, true);
    else gyro.current.initial = null;
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [cameraMode]);

  useFrame((state) => {
    if (cameraMode !== 'GYRO') return;

    // ✅ ปรับมุมกล้องต่ำลงและใกล้ขึ้น (Third-person view)
    const radius = 10; // ระยะห่างจาก Avatar
    const smoothing = 0.1;
    const targetY = 6; // ความสูงกล้อง (ต่ำลงตามสั่ง)

    const targetX = userPosition[0] + Math.sin(-gyro.current.alpha) * radius;
    const targetZ = userPosition[2] + Math.cos(-gyro.current.alpha) * radius;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, smoothing);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, smoothing);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, smoothing);

    // ✅ จ้องไปที่ตัว Avatar (สูงจากพื้น 1.5 หน่วย ระดับสายตาพอดี)
    state.camera.lookAt(userPosition[0], 1.5, userPosition[2]); 
  });

  return (
    <>
      <ambientLight intensity={1.5} /> 
      <Environment preset="city" /> 
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={45} />

      {cameraMode === 'FREE' && (
        <OrbitControls 
          key="free-mode"
          domElement={gl.domElement}
          makeDefault
          enableDamping
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2.1} // ล็อกไม่ให้มุดดิน
          minPolarAngle={0}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />
      )}

      <Suspense fallback={null}>
        <FloorModel floor={currentFloor} />
        <Avatar />
      </Suspense>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={30} blur={2} />
    </>
  );
}