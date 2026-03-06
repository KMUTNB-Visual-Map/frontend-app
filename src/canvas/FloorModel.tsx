import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

const MODEL_SCALE = 0.1;

// If your GLB is already Y-up on XZ plane, keep this at 0.
// If exported as Z-up (common in some DCC tools), set to -Math.PI / 2.
const MODEL_ROTATION_X = 0;

// Map north calibration (yaw around Y axis).
// Example: THREE.MathUtils.degToRad(12) to rotate 12 degrees.
const MODEL_YAW_OFFSET = THREE.MathUtils.degToRad(-48.72);

export default function FloorModel({ floor }: { floor: number }) {
  const { scene } = useGLTF(`/models/archif${floor}.glb`);

  const { model, offset } = useMemo(() => {
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
    tempRoot.rotation.set(MODEL_ROTATION_X, MODEL_YAW_OFFSET, 0);
    tempRoot.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(tempRoot);
    const center = box.getCenter(new THREE.Vector3());
    const minY = box.min.y;

    return {
      model: cloned,
      offset: new THREE.Vector3(-center.x, -minY, -center.z),
    };
  }, [scene]);

  return (
    <group
      scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}
      rotation={[MODEL_ROTATION_X, MODEL_YAW_OFFSET, 0]}
      position={[offset.x, offset.y, offset.z]}
    >
      <primitive object={model} />
    </group>
  );
}