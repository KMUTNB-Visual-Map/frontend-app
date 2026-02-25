import { useEffect, useState } from 'react';

export function useCamera() {
  const [mode, setMode] = useState<'FREE' | 'GYRO'>('FREE');

  useEffect(() => {
    const handleGyro = (e: DeviceOrientationEvent) => {
      if (mode === 'GYRO') {
        // Logic คำนวณองศาจากเซนเซอร์มือถือที่ไนท์เขียนไว้
      }
    };
    window.addEventListener('deviceorientation', handleGyro);
    return () => window.removeEventListener('deviceorientation', handleGyro);
  }, [mode]);

  return { mode, setMode };
}