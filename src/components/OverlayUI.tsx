import React from 'react';
import SearchBox from './SearchBox';
import FloorSelector from './FloorSelector';
import SetupModals from './SetupModals'; // ✅ นำเข้า Modal
import { useNavStore } from '../store/useNavStore';

export default function OverlayUI() {
  const { isFollowing, toggleGPS, cameraMode } = useNavStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] p-6 flex flex-col justify-between">
      
      {/* 🟢 วาง Modal ไว้ตรงนี้เพื่อทับหน้าจอทั้งหมด */}
      <SetupModals />

      <div className="flex justify-center w-full pointer-events-auto">
        <SearchBox />
      </div>

      <div className="flex flex-row justify-end items-end gap-4">
        <div className="flex flex-col gap-2 items-center">
          <div className="bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-sm">
            {cameraMode}
          </div>
          <button 
            onClick={() => toggleGPS()}
            className={`w-16 h-16 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center border-4 pointer-events-auto ${
              isFollowing ? 'bg-blue-600 border-blue-300 animate-pulse' : 'bg-white border-transparent'
            }`}
          >
            <span className="text-3xl">{isFollowing ? '📡' : '📍'}</span>
          </button>
        </div>

        <div className="pointer-events-auto">
          <FloorSelector />
        </div>
      </div>
    </div>
  );
}