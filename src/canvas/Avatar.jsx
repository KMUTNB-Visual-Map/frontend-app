import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavStore } from '../store/useNavStore';

const AVATAR_BASE_LIFT_Y = 0.12;
const AVATAR_RECALIBRATE_LIFT_Y = 0.42;
const AVATAR_LIFT_DAMP_FACTOR_NEAR = 2.25;
const AVATAR_LIFT_DAMP_FACTOR_FAR = 6.75;
const AVATAR_BLUE_MARKER_Y = 0.01;
const AVATAR_BLUE_MARKER_RADIUS = 0.1;

// 🟢 Component ย่อย: จัดการโหลดโมเดลและแอนิเมชัน
function AvatarModel({ type }) {
  const { userPosition, isFollowing, isRecalibrating } = useNavStore();
  const group = useRef(null); // ไร้คราบ TypeScript แน่นอนครับ
  const liftYRef = useRef(
    isRecalibrating ? AVATAR_RECALIBRATE_LIFT_Y : AVATAR_BASE_LIFT_Y
  );

  useFrame((_, delta) => {
    if (!group.current) return;

    const targetLiftY = isRecalibrating
      ? AVATAR_RECALIBRATE_LIFT_Y
      : AVATAR_BASE_LIFT_Y;

    const liftDistance = Math.abs(targetLiftY - liftYRef.current);
    const maxLiftDistance = Math.abs(
      AVATAR_RECALIBRATE_LIFT_Y - AVATAR_BASE_LIFT_Y
    );
    const normalizedDistance = THREE.MathUtils.clamp(
      maxLiftDistance > 0 ? liftDistance / maxLiftDistance : 0,
      0,
      1
    );
    const dynamicDamp = THREE.MathUtils.lerp(
      AVATAR_LIFT_DAMP_FACTOR_NEAR,
      AVATAR_LIFT_DAMP_FACTOR_FAR,
      normalizedDistance
    );

    // Ease-out like motion: fast at start, slower as it nears destination.
    liftYRef.current = THREE.MathUtils.damp(
      liftYRef.current,
      targetLiftY,
      dynamicDamp,
      delta
    );

    group.current.position.set(
      userPosition[0],
      userPosition[1] + liftYRef.current,
      userPosition[2]
    );
  });

  // 1. โหลดไฟล์ 3D ทั้งหมด (เพิ่มไฟล์เดินของผู้ชายแล้ว)
  const femaleIdle = useGLTF('/models/women_idle.glb');
  const femaleWalk = useGLTF('/models/women_idle.glb'); 
  const maleIdle = useGLTF('/models/men_idle.glb'); 
  const maleWalk = useGLTF('/models/men_idle.glb'); // ✅ ของนักเรียนชาย

  // 2. เลือกไฟล์ตามเพศ และสถานะการเดิน
  let currentModel = femaleIdle; 
  if (type === 'female') {
    currentModel = isFollowing ? femaleWalk : femaleIdle;
  } else if (type === 'male') {
    currentModel = isFollowing ? maleWalk : maleIdle; // ✅ ใส่เงื่อนไขเดินให้ผู้ชายแล้ว
  }

  // 3. Hook ดึงแอนิเมชัน
  const { actions, names } = useAnimations(currentModel.animations, group);

  useEffect(() => {
    if (names.length === 0) return;
    
    const actionName = names[0]; 
    const action = actions[actionName];
    
    // สั่งให้เล่นท่าทาง พร้อมเฟดอิน 0.2 วินาทีให้ดูเนียนตา
    action?.reset().fadeIn(0.2).play();

    return () => {
      action?.fadeOut(0.2);
    };
  }, [actions, names, currentModel]);

  return (
    <>
      <group
        ref={group}
        position={[
          userPosition[0],
          userPosition[1] + liftYRef.current,
          userPosition[2],
        ]}
        scale={[1, 1, 1]}
      >
        {/* ใส่ key บังคับโหลดใหม่เวลาสลับโมเดล ป้องกันการซ้อนทับ */}
        <primitive object={currentModel.scene} key={currentModel.scene.uuid} />
      </group>

      <mesh
        position={[userPosition[0], userPosition[1] + AVATAR_BLUE_MARKER_Y, userPosition[2]]}
      >
        <sphereGeometry args={[AVATAR_BLUE_MARKER_RADIUS, 20, 20]} />
        <meshStandardMaterial color="#111111" emissive="#111111" emissiveIntensity={0.35} />
      </mesh>
    </>
  );
}

// 🟢 Component หลัก: ประตูยามดักเงื่อนไข
export default function Avatar() {
  const { avatarType } = useNavStore();

  // ถ้าผู้ใช้ยังไม่ได้เลือก Avatar ใน Pop-up ก็จบงานเลย ไม่ต้องโหลด 3D
  if (!avatarType) return null;

  // ถ้าเลือกแล้ว ค่อยเรียก Component ตัวย่อยขึ้นมาทำงาน
  return <AvatarModel type={avatarType} />;
}

// โหลดไฟล์เตรียมไว้ล่วงหน้าทั้งหมด จะได้ไม่กระตุกตอนสลับท่า
useGLTF.preload('/models/women_idle.glb');
useGLTF.preload('/models/women_idle.glb');
useGLTF.preload('/models/men_idle.glb');
useGLTF.preload('/models/men_idle.glb'); // ✅ พรีโหลดท่าเดินชาย