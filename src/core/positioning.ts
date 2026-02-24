export type PositionMode = "GPS" | "MANUAL";

export interface Position {
  x: number;
  y: number;
  floor_id: number;
}

export class PositioningManager {
  private mode: PositionMode = "GPS";
  private currentPosition: Position = {
    x: 0,
    y: 0,
    floor_id: 1
  };

  setMode(mode: PositionMode) {
    this.mode = mode;
    console.log("Mode changed to:", mode);
  }

  getMode() {
    return this.mode;
  }

  updatePosition(pos: Position) {
    this.currentPosition = pos;
    console.log("Position updated:", pos);
  }

  getPosition() {
    return this.currentPosition;
  }
}