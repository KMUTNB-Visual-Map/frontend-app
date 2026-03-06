import { create } from 'zustand';
import { PositioningManager } from '../core/positioning';

let positioning: PositioningManager | null = null;
let mapOrigin: { x: number, y: number } | null = null;
let startDeadzoneUnlocked = false;
let mockTrackingTimer: ReturnType<typeof setInterval> | null = null;

const USE_MOCK_TRACKING = false;  ////////debug mock location
const MOCK_TRACKING_INTERVAL_MS = 1000;
const AUTO_SWITCH_FLOOR_FROM_TRACKING = false;

interface CalibrationPoint {
  lat: number;
  lon: number;
  x: number;
  y: number;
}

// GPS -> map calibration from two known points (lat, lon -> map x, y)
export const GPS_CALIBRATION_A: CalibrationPoint = {
  lat: 13.821299857933113,
  lon: 100.51370531178664,
  x: 20.05,
  y: 110.75,
};

export const GPS_CALIBRATION_B: CalibrationPoint = {
  lat: 13.821127,
  lon: 100.513257,
  x: 8.05,
  y: 58.75,
};

export const GPS_CALIBRATION_CHECK_POINT: CalibrationPoint = {
  lat: 13.821213428966557,
  lon: 100.51348115589333,
  x: 14.05,
  y: 84.75,
};

const MAP_X_PER_LON =
  (GPS_CALIBRATION_B.x - GPS_CALIBRATION_A.x) /
  (GPS_CALIBRATION_B.lon - GPS_CALIBRATION_A.lon);

const MAP_Y_PER_LAT =
  (GPS_CALIBRATION_B.y - GPS_CALIBRATION_A.y) /
  (GPS_CALIBRATION_B.lat - GPS_CALIBRATION_A.lat);

const WORLD_UNITS_PER_METER = 0.1;
const START_DEADZONE_METERS = 1;

export function gpsToMapXY(lat: number, lon: number) {
  const x = GPS_CALIBRATION_A.x + (lon - GPS_CALIBRATION_A.lon) * MAP_X_PER_LON;
  const y = GPS_CALIBRATION_A.y + (lat - GPS_CALIBRATION_A.lat) * MAP_Y_PER_LAT;

  return { x, y };
}

export function getThirdPointCalibrationCheck() {
  const predicted = gpsToMapXY(
    GPS_CALIBRATION_CHECK_POINT.lat,
    GPS_CALIBRATION_CHECK_POINT.lon
  );

  const errorX = predicted.x - GPS_CALIBRATION_CHECK_POINT.x;
  const errorY = predicted.y - GPS_CALIBRATION_CHECK_POINT.y;
  const errorDistance = Math.hypot(errorX, errorY);

  return {
    expected: { x: GPS_CALIBRATION_CHECK_POINT.x, y: GPS_CALIBRATION_CHECK_POINT.y },
    predicted,
    errorX,
    errorY,
    errorDistance,
  };
}

interface TargetLocation {
  location_id?: number | string;
  node_id?: number;
  name_th?: string;
  floor?: number;
  x?: number;
  z?: number;
}

interface GpsPosition {
  x: number;
  y: number;
  floor_id?: number;
}

interface MockMapPosition {
  x: number;
  y: number;
  floor_id?: number;
}

function clearMockTrackingTimer() {
  if (!mockTrackingTimer) return;
  clearInterval(mockTrackingTimer);
  mockTrackingTimer = null;
}

interface FloorMetrics {
  floor: number;
  width: number;
  depth: number;
  area: number;
  scale: number;
}

interface NavState {
  userId: string | null;

  // 🔹 UI floor
  currentFloor: number;

  // 🔹 Floor จริงจาก GPS
  userActualFloor: number | null;

  userPosition: [number, number, number];
  rawGpsPosition: [number, number] | null;
  convertedGpsMeters: [number, number] | null;
  targetLocation: TargetLocation | null;
  currentFloorMetrics: FloorMetrics | null;

  cameraMode: 'FREE' | 'FOLLOW';
  isFollowing: boolean;

  setupStep: string | null;
  avatarType: 'female' | 'male' | null;

  initGuestId: () => void;
  setSetupStep: (step: string | null)=> void;
  setAvatarType: (type: 'female' | 'male' | null) => void;
  setFloor: (floor: number) => void;
  confirmUserFloor: (floor: number) => void;
  setTarget: (location: TargetLocation | null) => void;
  setUserPosition: (position: [number, number, number]) => void;
  toggleFollowing: () => void;
  cycleCameraMode: () => void;
  setUserActualFloor: (floor: number) => void;
  setCurrentFloorMetrics: (metrics: FloorMetrics) => void;
  cancelSetup: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  userId: null,

  currentFloor: 1,
  userActualFloor: null,

  userPosition: [0, 0, 0],
  rawGpsPosition: null,
  convertedGpsMeters: null,
  targetLocation: null,
  currentFloorMetrics: null,

  cameraMode: 'FREE',
  isFollowing: false,

  setupStep: 'avatar',
  avatarType: null,

  setUserActualFloor: (floor) => set({ userActualFloor: floor }),

  setCurrentFloorMetrics: (metrics) => set({ currentFloorMetrics: metrics }),

  initGuestId: () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = Math.random().toString(16).slice(2, 10);
      localStorage.setItem('guest_id', id);
    }

    if (!positioning) {
      positioning = new PositioningManager(id);
    }

    set({ userId: id });
  },

  setSetupStep: (step) => set({ setupStep: step }),

  setAvatarType: (type) =>
    set({
      avatarType: type,
      setupStep: 'floor',
    }),

  cancelSetup: () => set({ setupStep: 'none' }),

  setFloor: (floor) =>
    set({ currentFloor: floor }),

  confirmUserFloor: (floor) =>
    set({
      userActualFloor: floor,
      currentFloor: floor,
      setupStep: 'none',
    }),

  setTarget: (location) => {
    set({ targetLocation: location });

    if (location && positioning) {
      positioning.setDestination({
        x: location.node_id || 0,
        y: location.node_id || 0,
        floor_id: location.floor || 1,
      });
    }
  },

  setUserPosition: (position) => set({ userPosition: position }),

  cycleCameraMode: () => {
    const current = get().cameraMode;
    set({ cameraMode: current === 'FREE' ? 'FOLLOW' : 'FREE' });
  },

  toggleFollowing: () => {
    const newState = !get().isFollowing;

    if (newState) {
      const selectedUserFloor = get().userActualFloor;
      mapOrigin = null;
      startDeadzoneUnlocked = false;
      clearMockTrackingTimer();

      set({
        userPosition: [0, 0, 0],
        rawGpsPosition: null,
        convertedGpsMeters: null,
        currentFloor: selectedUserFloor ?? get().currentFloor,
        isFollowing: true,
        cameraMode: 'FOLLOW',
      });

      const applyGpsPosition = (pos: GpsPosition) => {
        const mapped = gpsToMapXY(pos.x, pos.y);

        // Set origin once from first mapped point.
        if (!mapOrigin) {
          mapOrigin = { x: mapped.x, y: mapped.y };
        }

        const relativeX = mapped.x - mapOrigin.x;
        const relativeZ = mapped.y - mapOrigin.y;
        const distanceFromStart = Math.hypot(relativeX, relativeZ);

        if (!startDeadzoneUnlocked && distanceFromStart > START_DEADZONE_METERS) {
          startDeadzoneUnlocked = true;
        }

        const convertedX = mapped.x;
        const convertedZ = mapped.y;

        const worldX = relativeX * WORLD_UNITS_PER_METER;
        const worldZ = relativeZ * WORLD_UNITS_PER_METER;

        const shouldSyncFloor =
          AUTO_SWITCH_FLOOR_FROM_TRACKING && typeof pos.floor_id === 'number';

        set({
          userPosition: startDeadzoneUnlocked ? [worldX, 0, worldZ] : [0, 0, 0],
          rawGpsPosition: [pos.x, pos.y],
          convertedGpsMeters: [convertedX, convertedZ],
          userActualFloor: shouldSyncFloor ? (pos.floor_id as number) : get().userActualFloor,
          currentFloor: shouldSyncFloor ? (pos.floor_id as number) : get().currentFloor,
        });
      };

      const applyMockMapPosition = (pos: MockMapPosition) => {
        // Mock file values are already converted map meters.
        const worldX = pos.x * WORLD_UNITS_PER_METER;
        const worldZ = pos.y * WORLD_UNITS_PER_METER;

        const shouldSyncFloor =
          AUTO_SWITCH_FLOOR_FROM_TRACKING && typeof pos.floor_id === 'number';

        set({
          userPosition: [worldX, 0, worldZ],
          rawGpsPosition: null,
          convertedGpsMeters: [pos.x, pos.y],
          userActualFloor: shouldSyncFloor ? (pos.floor_id as number) : get().userActualFloor,
          currentFloor: shouldSyncFloor ? (pos.floor_id as number) : get().currentFloor,
        });
      };

      if (USE_MOCK_TRACKING) {
        void (async () => {
          try {
            const response = await fetch('/mock-user-path.json');
            if (!response.ok) {
              throw new Error(`Unable to load mock path (${response.status})`);
            }

            const path = (await response.json()) as MockMapPosition[];
            if (!Array.isArray(path) || path.length === 0) {
              throw new Error('Mock path file is empty');
            }

            let pathIndex = 0;
            applyMockMapPosition(path[pathIndex]);

            mockTrackingTimer = setInterval(() => {
              if (!get().isFollowing) {
                clearMockTrackingTimer();
                return;
              }

              pathIndex = (pathIndex + 1) % path.length;
              applyMockMapPosition(path[pathIndex]);
            }, MOCK_TRACKING_INTERVAL_MS);
          } catch (error) {
            console.error('Failed to start JSON tracking:', error);
            set({ isFollowing: false, cameraMode: 'FREE' });
            clearMockTrackingTimer();
          }
        })();
      } else {
        if (!positioning) return;

        positioning.startGPSMode((pos: GpsPosition) => {
          applyGpsPosition(pos);
        });
      }
    } else {
      set({
        isFollowing: false,
        cameraMode: 'FREE',
        rawGpsPosition: null,
        convertedGpsMeters: null,
      });

      mapOrigin = null;
      startDeadzoneUnlocked = false;
      clearMockTrackingTimer();

      if (positioning) {
        positioning.startManualMode();
      }
    }
  },
}));