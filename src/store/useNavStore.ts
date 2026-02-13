import { create } from 'zustand';

interface NavStore {
  userPos: { x: number, y: number, z: number };
  targetPath: any[];
  updatePos: (newPos: { x: number, y: number, z: number }) => void;
  setPath: (path: any[]) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  userPos: { x: 0, y: 0, z: 0 },
  targetPath: [],
  updatePos: (newPos) => set({ userPos: newPos }),
  setPath: (path) => set({ targetPath: path }),
}));