import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface NavState {
  guestId: string;
  currentFloor: number;
  userPosition: [number, number, number];
  targetLocation: any | null;
  cameraMode: 'FREE' | 'GYRO';
  isFollowing: boolean;
  
  // ✅ ต้องมี 2 บรรทัดนี้
  setupStep: 'none' | 'floor' | 'avatar';
  avatarType: 'female' | 'male' | null;

  initGuestId: () => void;
  setFloor: (floor: number) => void;
  setUserPosition: (pos: [number, number, number]) => void;
  setTarget: (location: any) => void;
  toggleGPS: () => Promise<void>;
  
  // ✅ ต้องมี 3 บรรทัดนี้
  setSetupStep: (step: 'none' | 'floor' | 'avatar') => void;
  setAvatarType: (type: 'female' | 'male' | null) => void;
  cancelSetup: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  guestId: localStorage.getItem('x-guest-id') || '',
  currentFloor: 1,
  userPosition: [0, 0, 0],
  targetLocation: null,
  cameraMode: 'FREE',
  isFollowing: false,
  
  // ✅ ค่าเริ่มต้น
  setupStep: 'none',
  avatarType: null,

  initGuestId: () => {
    let id = localStorage.getItem('x-guest-id') || uuidv4();
    localStorage.setItem('x-guest-id', id);
    set({ guestId: id });
  },

  setFloor: (floor) => {
    console.log("📍 Floor:", floor, "ID:", get().guestId);
    set({ currentFloor: floor });
  },

  setUserPosition: (pos) => set({ userPosition: pos }),
  setTarget: (location) => set({ targetLocation: location }),

  toggleGPS: async () => {
    const isNowFollowing = get().isFollowing;
    if (!isNowFollowing) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res !== 'granted') return;
      }
    }
    set((state) => ({
      isFollowing: !state.isFollowing,
      cameraMode: !state.isFollowing ? 'GYRO' : 'FREE'
    }));
  },

  // ✅ ฟังก์ชันที่ SearchBox เรียกใช้ต้องอยู่ตรงนี้
  setSetupStep: (step) => set({ setupStep: step }),
  setAvatarType: (type) => set({ avatarType: type }),
  cancelSetup: () => set({ setupStep: 'none', targetLocation: null }),
}));