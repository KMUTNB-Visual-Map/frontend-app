import { create } from 'zustand';
import { PositioningManager } from '../core/positioning';

let positioning: PositioningManager | null = null;
const AUTO_SWITCH_FLOOR_FROM_TRACKING = false;

type TrackingSource = 'gps' | 'none';
const DEFAULT_TRACKING_SOURCE: Exclude<TrackingSource, 'none'> = 'gps';

interface CalibrationPoint {
  lat: number;
  lon: number;
  x: number;
  y: number;
}

// Centralized calibration/config section.
const MAP_CALIBRATION_CONFIG = {
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

export const GPS_CALIBRATION_A = MAP_CALIBRATION_CONFIG.ORIGIN_A;
export const GPS_CALIBRATION_B = MAP_CALIBRATION_CONFIG.ORIGIN_B;
export const GPS_CALIBRATION_CHECK_POINT = MAP_CALIBRATION_CONFIG.CHECK_POINT;

const MAP_X_PER_LON =
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.x - MAP_CALIBRATION_CONFIG.ORIGIN_A.x) /
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.lon - MAP_CALIBRATION_CONFIG.ORIGIN_A.lon);

const MAP_Y_PER_LAT =
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.y - MAP_CALIBRATION_CONFIG.ORIGIN_A.y) /
  (MAP_CALIBRATION_CONFIG.ORIGIN_B.lat - MAP_CALIBRATION_CONFIG.ORIGIN_A.lat);

const ENABLE_COORDINATE_DEBUG_LOGS = import.meta.env.DEV;

function mapToWorldXZ(x: number, y: number) {
  const world = {
    worldX: x * MAP_CALIBRATION_CONFIG.WORLD_SCALE,
    worldZ: y * MAP_CALIBRATION_CONFIG.WORLD_SCALE,
  };

  if (ENABLE_COORDINATE_DEBUG_LOGS) {
    console.log('[coord] step2 mapToWorldXZ', {
      inputMap: { x, y },
      world,
      worldScale: MAP_CALIBRATION_CONFIG.WORLD_SCALE,
    });
  }

  return world;
}

export function gpsToMapXY(lat: number, lon: number) {
  const x =
    MAP_CALIBRATION_CONFIG.ORIGIN_A.x +
    (lon - MAP_CALIBRATION_CONFIG.ORIGIN_A.lon) * MAP_X_PER_LON;
  const y =
    MAP_CALIBRATION_CONFIG.ORIGIN_A.y +
    (lat - MAP_CALIBRATION_CONFIG.ORIGIN_A.lat) * MAP_Y_PER_LAT;

  if (ENABLE_COORDINATE_DEBUG_LOGS) {
    console.log('[coord] step1 gpsToMapXY', {
      inputGps: { lat, lon },
      map: { x, y },
      calibration: {
        originA: MAP_CALIBRATION_CONFIG.ORIGIN_A,
        originB: MAP_CALIBRATION_CONFIG.ORIGIN_B,
        mapXPerLon: MAP_X_PER_LON,
        mapYPerLat: MAP_Y_PER_LAT,
      },
    });
  }

  return { x, y };
}

export function gpsToWorldXZ(lat: number, lon: number) {
  if (ENABLE_COORDINATE_DEBUG_LOGS) {
    console.log('[coord] input gpsToWorldXZ', { lat, lon });
  }

  const mapped = gpsToMapXY(lat, lon);
  const world = mapToWorldXZ(mapped.x, mapped.y);

  if (ENABLE_COORDINATE_DEBUG_LOGS) {
    console.log('[coord] step3 gpsToWorldXZ result', {
      inputGps: { lat, lon },
      map: mapped,
      world,
    });
  }

  return world;
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
  markerKey?: string;
  floor?: number;
  lat?: number;
  lon?: number;
  x?: number;
  z?: number;
}

interface GpsPosition {
  x: number;
  y: number;
  floor_id?: number;
}

interface FloorMetrics {
  floor: number;
  width: number;
  depth: number;
  area: number;
  scale: number;
}

interface MapClickPoint {
  x: number;
  z: number;
  floor: number;
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
  lastMapClickPoint: MapClickPoint | null;
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
  setLastMapClickPoint: (point: MapClickPoint | null) => void;
  cancelSetup: () => void;
}

export const useNavStore = create<NavState>((set, get) => {
  const clearTrackingSourceRuntime = () => {
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

    const convertedMeters = {
      x: transformed.worldX / MAP_CALIBRATION_CONFIG.WORLD_SCALE,
      y: transformed.worldZ / MAP_CALIBRATION_CONFIG.WORLD_SCALE,
    };

    const shouldSyncFloor =
      AUTO_SWITCH_FLOOR_FROM_TRACKING && typeof floorId === 'number';

    set({
      userPosition: [transformed.worldX, 0, transformed.worldZ],
      rawGpsPosition: [lat, lon],
      convertedGpsMeters: [convertedMeters.x, convertedMeters.y],
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

    return startGpsTracking();
  };

  return ({
  userId: null,

  currentFloor: 1,
  userActualFloor: null,

  userPosition: [0, 0, 0],
  rawGpsPosition: null,
  convertedGpsMeters: null,
  lastMapClickPoint: null,
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

  setLastMapClickPoint: (point) => set({ lastMapClickPoint: point }),

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
    if (!location) {
      set({ targetLocation: null });
      return;
    }

    const updates: Partial<NavState> = {
      targetLocation: location,
    };

    if (typeof location.floor === 'number') {
      updates.currentFloor = location.floor;
    }

    if (typeof location.lat === 'number' && typeof location.lon === 'number') {
      const transformed = gpsToWorldXZ(location.lat, location.lon);

      updates.userPosition = [transformed.worldX, 0, transformed.worldZ];
      updates.rawGpsPosition = [location.lat, location.lon];
      updates.convertedGpsMeters = [
        transformed.worldX / MAP_CALIBRATION_CONFIG.WORLD_SCALE,
        transformed.worldZ / MAP_CALIBRATION_CONFIG.WORLD_SCALE,
      ];
    }

    if (get().isFollowing) {
      clearTrackingSourceRuntime();
      updates.isFollowing = false;
      updates.trackingSource = 'none';
      updates.cameraMode = 'FREE';
    }

    set(updates);
  },

  setUserPosition: (position) =>
    set((state) => ({
      userPosition: position,
      userActualFloor: state.currentFloor,
    })),

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