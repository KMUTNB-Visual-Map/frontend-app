import { gpsToWorldXZ } from '../store/useNavStore';
import { LANDMARKS_DATA } from './landmark';
import type { Landmark } from './landmark';

export interface WorldPositionXZ {
  x: number;
  z: number;
}

const nodeLookup = new Map<number, Landmark>(
  LANDMARKS_DATA.map((landmark) => [landmark.node_id, landmark])
);

const worldPositionCache = new Map<number, WorldPositionXZ>();

export function getNodeById(nodeId: number): Landmark | null {
  const node = nodeLookup.get(nodeId) ?? null;
  if (!node) {
    console.warn(`[nodeWorldPosition] Node not found for node_id=${nodeId}`);
  }
  return node;
}

export function getNodeWorldPosition(nodeId: number): WorldPositionXZ | null {
  const cached = worldPositionCache.get(nodeId);
  if (cached) {
    return cached;
  }

  const node = getNodeById(nodeId);
  if (!node) {
    return null;
  }

  const world = gpsToWorldXZ(node.lat, node.lng);
  const position: WorldPositionXZ = {
    x: world.worldX,
    z: world.worldZ,
  };

  worldPositionCache.set(nodeId, position);
  return position;
}
