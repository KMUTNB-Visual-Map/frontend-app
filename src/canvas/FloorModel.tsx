import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';

const MODEL_SCALE = 0.1;

// If your GLB is already Y-up on XZ plane, keep this at 0.
// If exported as Z-up (common in some DCC tools), set to -Math.PI / 2.
const MODEL_ROTATION_X = 0;

// Map north calibration (yaw around Y axis).
// Example: THREE.MathUtils.degToRad(12) to rotate 12 degrees.
const MODEL_YAW_OFFSET = THREE.MathUtils.degToRad(-8);

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

export default function FloorModel({ floor, onMetricsComputed }: FloorModelProps) {
  const { scene } = useGLTF(`/models/archif${floor}.glb`);

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
          console.log(`📍 พิกัด 3D -> X: ${e.point.x.toFixed(2)}, Z: ${e.point.z.toFixed(2)} (ชั้น ${floor})`);
        }}
      >
        <primitive object={model} />
      </group>
    );
}