import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface RedPinProps {
  position: [number, number, number];
}

const PIN_SCALE = 1.00;
const PIN_FLOAT_OFFSET = 1.00;
const PIN_FLOAT_AMPLITUDE = 0.05; //ตัวแปรให้model red pinลอยสูงขั้น
const PIN_FLOAT_SPEED = 2.4;
const PIN_POP_BOUNCE_HEIGHT = 0.16;
const PIN_POP_BOUNCE_SPEED = 8.0;
const PIN_POP_DAMPING = 3.2;

export default function RedPin({ position }: RedPinProps) {
  const { scene } = useGLTF('/models/redpin.glb');
  const groupRef = useRef<THREE.Group>(null);
  const spawnTimeRef = useRef<number | null>(null);

  const pinModel = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return cloned;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (spawnTimeRef.current === null) {
      spawnTimeRef.current = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime();
    const sinceSpawn = elapsed - spawnTimeRef.current;

    const floatY =
      PIN_FLOAT_OFFSET + Math.sin(elapsed * PIN_FLOAT_SPEED) * PIN_FLOAT_AMPLITUDE;

    const popBounce =
      Math.max(0, Math.sin(sinceSpawn * PIN_POP_BOUNCE_SPEED)) *
      Math.exp(-sinceSpawn * PIN_POP_DAMPING) *
      PIN_POP_BOUNCE_HEIGHT;

    groupRef.current.position.set(position[0], position[1] + floatY + popBounce, position[2]);
  });

  return (
    <group ref={groupRef} position={position} scale={[PIN_SCALE, PIN_SCALE, PIN_SCALE]}>
      <primitive object={pinModel} />
    </group>
  );
}

useGLTF.preload('/models/redpin.glb');
