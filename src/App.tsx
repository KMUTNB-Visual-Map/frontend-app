import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import MapCanvas from './canvas/MapCanvas'; // Import แบบ Default
import OverlayUI from './components/OverlayUI';
import { useNavStore } from './store/useNavStore';

function App() {
  // ดึงฟังก์ชันออกมาให้ถูกวิธี
  const initGuestId = useNavStore((state) => state.initGuestId);

  useEffect(() => {
    if (typeof initGuestId === 'function') {
      initGuestId();
    }
  }, [initGuestId]);

  return (
    <div className="w-screen h-screen relative bg-slate-900">
      <Canvas shadows>
        <MapCanvas />
      </Canvas>
      <OverlayUI />
    </div>
  );
}

export default App;