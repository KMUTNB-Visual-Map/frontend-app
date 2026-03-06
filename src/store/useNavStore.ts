import { create } from 'zustand';
import { PositioningManager } from '../core/positioning';

let positioning: PositioningManager | null = null;
let mockTrackingTimer: ReturnType<typeof setInterval> | null = null;
let mockTrackingSessionToken = 0;

const USE_MOCK_TRACKING = false;  ////////debug mock location
const MOCK_TRACKING_INTERVAL_MS = 1000;
const AUTO_SWITCH_FLOOR_FROM_TRACKING = false;

type TrackingSource = 'gps' | 'mock' | 'none';
const DEFAULT_TRACKING_SOURCE: Exclude<TrackingSource, 'none'> =
  USE_MOCK_TRACKING ? 'mock' : 'gps';

interface CalibrationPoint {
  lat: number;
  lon: number;
  x: number;
  y: number;
}

// Centralized calibration/config section.
const MAP_CALIBRATION_CONFIG = {
  // Rotation angle for map alignment (degrees).
  MAP_ROTATION_DEG: 145,

  // Scale from map units (meters) to world units.
  WORLD_SCALE: 0.1,

  // GPS -> map reference points.
  ORIGIN_A: {
    lat: 13.821299857933113,
    lon: 100.51370531178664,
    x: 20.05,
    y: 110.75,
  } as CalibrationPoint,
  ORIGIN_B: {
    lat: 13.821127,
    lon: 100.513257,
    x: 8.05,
    y: 58.75,
  } as CalibrationPoint,

  // Validation checkpoint for calibration quality.
  CHECK_POINT: {
    lat: 13.821213428966557,
    lon: 100.51348115589333,
    x: 14.05,
    y: 84.75,
  } as CalibrationPoint,
};

export const MAP_ROTATION_DEG = MAP_CALIBRATION_CONFIG.MAP_ROTATION_DEG;
export const GPS_CALIBRATION_A = MAP_CALIBRATION_CONFIG.ORIGIN_A;
export const GPS_CALIBRATION_B = MAP_CALIBRATION_CONFIG.ORIGIN_B;
export const GPS_CALIBRATION_CHECK_POINT = MAP_CALIBRATION_CONFIG.CHECK_POINT;

const MAP_X_PER_LON =
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.x - MAP_CALIBRATION_CONFIG.ORIGIN_A.x) /
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.lon - MAP_CALIBRATION_CONFIG.ORIGIN_A.lon);

const MAP_Y_PER_LAT =
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.y - MAP_CALIBRATION_CONFIG.ORIGIN_A.y) /
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.lat - MAP_CALIBRATION_CONFIG.ORIGIN_A.lat);

const theta = (MAP_ROTATION_DEG * Math.PI) / 180;
const cosTheta = Math.cos(theta);
const sinTheta = Math.sin(theta);

function rotateMapXY(x: number, y: number) {
  const xRot = x * cosTheta - y * sinTheta;
  const yRot = x * sinTheta + y * cosTheta;

  return { x: xRot, y: yRot };
}

function mapToWorldXZ(x: number, y: number) {
  const rotated = rotateMapXY(x, y);

  return {
    worldX: rotated.x * MAP_CALIBRATION_CONFIG.WORLD_SCALE,
    worldZ: rotated.y * MAP_CALIBRATION_CONFIG.WORLD_SCALE,
    xRot: rotated.x,
    yRot: rotated.y,
  };
}

export function gpsToMapXY(lat: number, lon: number) {
  const x =
    MAP_CALIBRATION_CONFIG.ORIGIN_A.x +
    (lon - MAP_CALIBRATION_CONFIG.ORIGIN_A.lon) * MAP_X_PER_LON;
  const y =
    MAP_CALIBRATION_CONFIG.ORIGIN_A.y +
    (lat - MAP_CALIBRATION_CONFIG.ORIGIN_A.lat) * MAP_Y_PER_LAT;

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
  lat: number;
  lon: number;
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
  trackingSource: TrackingSource;
  preferredTrackingSource: Exclude<TrackingSource, 'none'>;

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
  switchTrackingSource: (source: Exclude<TrackingSource, 'none'>) => void;
  setPreferredTrackingSource: (source: Exclude<TrackingSource, 'none'>) => void;
  cycleCameraMode: () => void;
  setUserActualFloor: (floor: number) => void;
  setCurrentFloorMetrics: (metrics: FloorMetrics) => void;
  cancelSetup: () => void;
}

export const useNavStore = create<NavState>((set, get) => {
  const clearTrackingSourceRuntime = () => {
    mockTrackingSessionToken += 1;
    clearMockTrackingTimer();

    if (positioning) {
      positioning.startManualMode();
    }
  };

  const applyTrackingPosition = (
    lat: number,
    lon: number,
    floorId: number | undefined,
    source: Exclude<TrackingSource, 'none'>
  ) => {
    const state = get();
    if (!state.isFollowing) return;
    if (state.trackingSource !== source) return;

    const mapped = gpsToMapXY(lat, lon);
    const transformed = mapToWorldXZ(mapped.x, mapped.y);

    const shouldSyncFloor =
      AUTO_SWITCH_FLOOR_FROM_TRACKING && typeof floorId === 'number';

    set({
      userPosition: [transformed.worldX, 0, transformed.worldZ],
      rawGpsPosition: [lat, lon],
      convertedGpsMeters: [transformed.xRot, transformed.yRot],
      userActualFloor: shouldSyncFloor ? floorId : get().userActualFloor,
      currentFloor: shouldSyncFloor ? floorId : get().currentFloor,
    });
  };

  const startGpsTracking = (): boolean => {
    if (!positioning) {
      return false;
    }

    const started = positioning.startGPSMode((pos: GpsPosition) => {
      applyTrackingPosition(pos.x, pos.y, pos.floor_id, 'gps');
    });

    if (!started) {
      return false;
    }

    set({
      isFollowing: true,
      cameraMode: 'FOLLOW',
      trackingSource: 'gps',
    });

    return true;
  };

  const startMockTracking = async (): Promise<boolean> => {
    const sessionToken = ++mockTrackingSessionToken;

    try {
      const response = await fetch('/mock-user-path.json');
      if (!response.ok) {
        throw new Error(`Unable to load mock path (${response.status})`);
      }

      const path = (await response.json()) as MockMapPosition[];
      if (!Array.isArray(path) || path.length === 0) {
        throw new Error('Mock path file is empty');
      }

      // Source changed while loading, abort startup.
      if (sessionToken !== mockTrackingSessionToken) {
        return false;
      }

      set({
        isFollowing: true,
        cameraMode: 'FOLLOW',
        trackingSource: 'mock',
      });

      let pathIndex = 0;
      const applyCurrentPoint = () => {
        const point = path[pathIndex];
        applyTrackingPosition(point.lat, point.lon, point.floor_id, 'mock');
      };

      applyCurrentPoint();

      mockTrackingTimer = setInterval(() => {
        const state = get();
        if (
          !state.isFollowing ||
          state.trackingSource !== 'mock' ||
          sessionToken !== mockTrackingSessionToken
        ) {
          clearMockTrackingTimer();
          return;
        }

        pathIndex = (pathIndex + 1) % path.length;
        applyCurrentPoint();
      }, MOCK_TRACKING_INTERVAL_MS);

      return true;
    } catch (error) {
      console.error('Failed to start JSON tracking:', error);
      return false;
    }
  };

  const startTrackingBySource = async (
    source: Exclude<TrackingSource, 'none'>
  ): Promise<boolean> => {
    const selectedUserFloor = get().userActualFloor;

    set({
      userPosition: [0, 0, 0],
      rawGpsPosition: null,
      convertedGpsMeters: null,
      currentFloor: selectedUserFloor ?? get().currentFloor,
      isFollowing: false,
      trackingSource: source,
    });

    if (source === 'gps') {
      return startGpsTracking();
    }

    return startMockTracking();
  };

  return ({
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
  trackingSource: 'none',
  preferredTrackingSource: DEFAULT_TRACKING_SOURCE,

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

  setPreferredTrackingSource: (source) => {
    set({ preferredTrackingSource: source });
  },

  switchTrackingSource: (source) => {
    set({ preferredTrackingSource: source });

    if (!get().isFollowing) {
      return;
    }

    void (async () => {
      clearTrackingSourceRuntime();

      const started = await startTrackingBySource(source);
      if (!started) {
        clearTrackingSourceRuntime();
        set({
          isFollowing: false,
          trackingSource: 'none',
          cameraMode: 'FREE',
          rawGpsPosition: null,
          convertedGpsMeters: null,
        });
      }
    })();
  },

  cycleCameraMode: () => {
    const current = get().cameraMode;
    set({ cameraMode: current === 'FREE' ? 'FOLLOW' : 'FREE' });
  },

  toggleFollowing: () => {
    const newState = !get().isFollowing;

    if (newState) {
      const requestedSource = get().preferredTrackingSource;

      void (async () => {
        clearTrackingSourceRuntime();

        const started = await startTrackingBySource(requestedSource);
        if (!started) {
          clearTrackingSourceRuntime();
          set({
            isFollowing: false,
            trackingSource: 'none',
            cameraMode: 'FREE',
            rawGpsPosition: null,
            convertedGpsMeters: null,
          });
        }
      })();
    } else {
      clearTrackingSourceRuntime();
      set({
        isFollowing: false,
        trackingSource: 'none',
        cameraMode: 'FREE',
        rawGpsPosition: null,
        convertedGpsMeters: null,
      });
    }
  },
  });
});