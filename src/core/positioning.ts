import { startGPS } from "./gps";
import { sendPosition } from "./socket";

export type PositionMode = "GPS" | "MANUAL";

export interface Position {
  x: number;
  y: number;
  floor_id: number;
}

export class PositioningManager {

  private guestId: string;

  constructor(guestId: string) {
    this.guestId = guestId;
  }

  private readonly gpsUpdateIntervalMs = 2000;
  private readonly maxAcceptedGpsAccuracyMeters = 20;
  private readonly gpsSmoothingWindowSize = 5;
  private lastGpsUpdateAt = 0;
  private activeGpsWatchId: number | null = null;
  private stopGpsWatch: (() => void) | null = null;
  private gpsSessionToken = 0;
  private gpsRecentSamples: Array<{ x: number; y: number }> = [];

  private mode: PositionMode = "GPS";

  private currentPosition: Position = {
    x: 0,
    y: 0,
    floor_id: 1,
  };

  /* =======================
     Route Path Integration
  ======================= */

  private routePath: Position[] = [];

  setRoutePath(path: Position[]) {
    this.routePath = path;

    if (path.length > 0) {
      const lastPoint = path[path.length - 1];
      this.setDestination(lastPoint);
    }
  }

  getRoutePath() {
    return this.routePath;
  }

  /* =======================
     Arrival Logic
  ======================= */

  private destination: Position | null = null;
  private arrivalThreshold = 5;

  private hasArrived = false;

  private onArrivedCallback?: () => void;

  setDestination(dest: Position) {
    this.destination = dest;
    this.hasArrived = false;
  }

  onArrived(callback: () => void) {
    this.onArrivedCallback = callback;
  }

  private calculateDistance(a: Position, b: Position): number {
    return Math.sqrt(
      (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2
    );
  }

  private checkArrival() {
    if (!this.destination) return;

    const distance = this.calculateDistance(
      this.currentPosition,
      this.destination
    );

    if (distance < this.arrivalThreshold && !this.hasArrived) {
      this.hasArrived = true;

      console.log("🎉 Arrived at destination");

      if (this.onArrivedCallback) {
        this.onArrivedCallback();
      }
    }
  }

  /* =======================
     Manual Mode
  ======================= */

  startManualMode() {
    this.stopGPSMode();
    this.mode = "MANUAL";
  }

  updateManualPosition(x: number, y: number) {
    const position: Position = {
      x,
      y,
      floor_id: 1,
    };

    this.currentPosition = position;

    sendPosition({
      guest_id: this.guestId,
      mode: "MANUAL",
      geom: { x, y },
      floor_id: 1,
    });

    this.checkArrival();
  }

  /* =======================
     GPS Mode
  ======================= */

  startGPSMode(onUpdate: (pos: Position) => void): boolean {
    this.stopGPSMode();
    this.mode = "GPS";
    this.lastGpsUpdateAt = 0;
    this.gpsRecentSamples = [];
    const sessionToken = ++this.gpsSessionToken;

    const watchHandle = startGPS((gpsPos) => {
      if (this.mode !== "GPS") {
        return;
      }

      if (sessionToken !== this.gpsSessionToken) {
        return;
      }

      if (!Number.isFinite(gpsPos.accuracy) || gpsPos.accuracy > this.maxAcceptedGpsAccuracyMeters) {
        return;
      }

      const now = Date.now();
      if (now - this.lastGpsUpdateAt < this.gpsUpdateIntervalMs) {
        return;
      }
      this.lastGpsUpdateAt = now;

      this.gpsRecentSamples.push({ x: gpsPos.x, y: gpsPos.y });
      if (this.gpsRecentSamples.length > this.gpsSmoothingWindowSize) {
        this.gpsRecentSamples.shift();
      }

      const smoothed = this.gpsRecentSamples.reduce(
        (acc, sample) => {
          acc.x += sample.x;
          acc.y += sample.y;
          return acc;
        },
        { x: 0, y: 0 }
      );

      const sampleCount = this.gpsRecentSamples.length;
      const smoothedX = smoothed.x / sampleCount;
      const smoothedY = smoothed.y / sampleCount;

      const position: Position = {
        x: smoothedX,
        y: smoothedY,
        floor_id: 1,
      };

      this.currentPosition = position;

      sendPosition({
        guest_id: this.guestId,
        mode: "GPS",
        geom: {
          x: position.x,
          y: position.y,
        },
        floor_id: position.floor_id,
      });

      this.checkArrival();
      onUpdate(position);
    });

    if (!watchHandle) {
      this.mode = "MANUAL";
      return false;
    }

    this.activeGpsWatchId = watchHandle.watchId;
    this.stopGpsWatch = watchHandle.stop;
    return true;
  }

  stopGPSMode() {
    this.gpsSessionToken += 1;
    this.gpsRecentSamples = [];

    if (this.stopGpsWatch) {
      this.stopGpsWatch();
      this.stopGpsWatch = null;
      this.activeGpsWatchId = null;
      return;
    }

    if (this.activeGpsWatchId !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(this.activeGpsWatchId);
    }

    this.activeGpsWatchId = null;
  }

  /* =======================
     Getter
  ======================= */

  getPosition() {
    return this.currentPosition;
  }

  getMode() {
    return this.mode;
  }
}