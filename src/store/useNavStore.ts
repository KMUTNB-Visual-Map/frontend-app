import { create } from 'zustand';
import { PositioningManager } from '../core/positioning';

let positioning: PositioningManager | null = null;
let gpsOrigin: { x: number, y: number } | null = null;

// 🟢 ค่าคงที่สำหรับแปลงพิกัด GPS เป็นเมตร (ประมาณ 111,319 เมตร ต่อ 1 องศา)
const METER_SCALE = 111319;

interface NavState {
  userId: string | null;
  currentFloor: number;
  userPosition: [number, number, number];
  targetLocation: any | null;
  cameraMode: 'FREE' | 'FOLLOW';
  isFollowing: boolean;
  setupStep: string | null;
  avatarType: 'female' | 'male' | null;
  
  initGuestId: () => void;
  setSetupStep: (step: string | null) => void;
  setAvatarType: (type: 'female' | 'male' | null) => void;
  setFloor: (floor: number) => void;
  setTarget: (location: any | null) => void;
  toggleFollowing: () => void;
  cycleCameraMode: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  userId: null,
  currentFloor: 1,
  userPosition: [0, 0, 0],
  targetLocation: null,
  cameraMode: 'FREE',
  isFollowing: false,
  setupStep: 'avatar',
  avatarType: null,

  initGuestId: () => {
    let id = localStorage.getItem("guest_id");
    if (!id) {
      id = Math.random().toString(16).slice(2, 10);
      localStorage.setItem("guest_id", id);
    }
    if (!positioning) positioning = new PositioningManager(id);
    set({ userId: id });
  },

  setSetupStep: (step) => set({ setupStep: step }),
  setAvatarType: (type) => set({ avatarType: type, setupStep: 'floor' }),
  setFloor: (floor) => set({ currentFloor: floor, setupStep: null }),

  setTarget: (location) => {
    set({ targetLocation: location });
    if (location && positioning) {
      positioning.setDestination({
        x: location.node_id || 0,
        y: location.node_id || 0,
        floor_id: location.floor || 1
      });
    }
  },

  cycleCameraMode: () => {
    set({ cameraMode: get().cameraMode === 'FREE' ? 'FOLLOW' : 'FREE' });
  },

  toggleFollowing: () => {
    const newState = !get().isFollowing;
    
    if (newState) {
      gpsOrigin = null; 
      set({ userPosition: [0, 0, 0], isFollowing: true, cameraMode: 'FOLLOW' });

      if (positioning) {
        positioning.startGPSMode((pos) => {
          if (!gpsOrigin) {
            gpsOrigin = { x: pos.x, y: pos.y };
          }

          // 🟢 แปลงความต่างของพิกัดให้เป็น "เมตร" เพื่อให้ตัวละครขยับเห็นชัดเจน
          const relativeX = (pos.x - gpsOrigin.x) * METER_SCALE;
          const relativeZ = (pos.y - gpsOrigin.y) * METER_SCALE;

          console.log(`🚶 กำลังเดิน: X=${relativeX.toFixed(2)}, Z=${relativeZ.toFixed(2)}`);
          set({ userPosition: [relativeX, 0, relativeZ] });
        });
      }
    } else {
      set({ isFollowing: false, cameraMode: 'FREE' });
      gpsOrigin = null;
      if (positioning) positioning.startManualMode();
    }
  }
}));