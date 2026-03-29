import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';

const HALLWAY_CONNECT_THRESHOLD = 0.8;

export interface Vec2 {
  x: number;
  z: number;
}

export interface LandmarkRow {
  node_id?: number | null;
  floor_id: number;
  name_th?: string;
  type?: string;
  x?: number | null;
  z?: number | null;
  ax?: number | null;
  az?: number | null;
  bx?: number | null;
  bz?: number | null;
}

export interface FlowADestination {
  floor_id: number;
  node_id?: number | null;
  x?: number | null;
  z?: number | null;
}

export interface FlowARequest {
  currentPosition: Vec2;
  currentFloor: number;
  destination: FlowADestination;
  rows?: LandmarkRow[];
}

export interface FlowASegment {
  kind: 'to_hallway' | 'hallway' | 'to_destination';
  from: Vec2;
  to: Vec2;
}

export interface FlowAResult {
  ok: boolean;
  reason?: string;
  points: Vec2[];
  segments: FlowASegment[];
  startHallwayNodeId?: number;
  endHallwayNodeId?: number;
}

interface HallwaySegment {
  nodeId: number;
  floorId: number;
  a: Vec2;
  b: Vec2;
}

interface ProjectionResult {
  point: Vec2;
  t: number;
  distanceSq: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function distanceSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function midpoint(a: Vec2, b: Vec2): Vec2 {
  return {
    x: (a.x + b.x) / 2,
    z: (a.z + b.z) / 2,
  };
}

function projectPointToSegment(point: Vec2, a: Vec2, b: Vec2): ProjectionResult {
  const vx = b.x - a.x;
  const vz = b.z - a.z;
  const lenSq = vx * vx + vz * vz;

  if (lenSq <= 0.000001) {
    return {
      point: { x: a.x, z: a.z },
      t: 0,
      distanceSq: distanceSq(point, a),
    };
  }

  const tRaw = ((point.x - a.x) * vx + (point.z - a.z) * vz) / lenSq;
  const t = Math.max(0, Math.min(1, tRaw));
  const projected = {
    x: a.x + t * vx,
    z: a.z + t * vz,
  };

  return {
    point: projected,
    t,
    distanceSq: distanceSq(point, projected),
  };
}

function closestPointsBetweenSegments(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2
): { pointA: Vec2; pointB: Vec2; distanceSq: number } {
  const candidates: Array<{ pointA: Vec2; pointB: Vec2; distanceSq: number }> = [];

  const paOnB1 = projectPointToSegment(a1, b1, b2).point;
  candidates.push({ pointA: a1, pointB: paOnB1, distanceSq: distanceSq(a1, paOnB1) });

  const paOnB2 = projectPointToSegment(a2, b1, b2).point;
  candidates.push({ pointA: a2, pointB: paOnB2, distanceSq: distanceSq(a2, paOnB2) });

  const pbOnA1 = projectPointToSegment(b1, a1, a2).point;
  candidates.push({ pointA: pbOnA1, pointB: b1, distanceSq: distanceSq(pbOnA1, b1) });

  const pbOnA2 = projectPointToSegment(b2, a1, a2).point;
  candidates.push({ pointA: pbOnA2, pointB: b2, distanceSq: distanceSq(pbOnA2, b2) });

  let best = candidates[0];
  for (let i = 1; i < candidates.length; i += 1) {
    if (candidates[i].distanceSq < best.distanceSq) {
      best = candidates[i];
    }
  }

  return best;
}

function resolveDestinationAnchor(rows: LandmarkRow[], destination: FlowADestination): Vec2 | null {
  if (isFiniteNumber(destination.x) && isFiniteNumber(destination.z)) {
    return { x: destination.x, z: destination.z };
  }

  if (!isFiniteNumber(destination.node_id)) {
    return null;
  }

  const row = rows.find((item) => item.node_id === destination.node_id);
  if (!row) {
    return null;
  }

  if (isFiniteNumber(row.x) && isFiniteNumber(row.z)) {
    return { x: row.x, z: row.z };
  }

  if (
    isFiniteNumber(row.ax) &&
    isFiniteNumber(row.az) &&
    isFiniteNumber(row.bx) &&
    isFiniteNumber(row.bz)
  ) {
    return midpoint({ x: row.ax, z: row.az }, { x: row.bx, z: row.bz });
  }

  return null;
}

function buildHallwaySegments(rows: LandmarkRow[], floorId: number): HallwaySegment[] {
  const hallways: HallwaySegment[] = [];

  for (const row of rows) {
    if (row.floor_id !== floorId) continue;
    if (String(row.type).toLowerCase() !== 'hallway') continue;
    if (!isFiniteNumber(row.node_id)) continue;
    if (!isFiniteNumber(row.ax) || !isFiniteNumber(row.az)) continue;
    if (!isFiniteNumber(row.bx) || !isFiniteNumber(row.bz)) continue;

    hallways.push({
      nodeId: row.node_id,
      floorId,
      a: { x: row.ax, z: row.az },
      b: { x: row.bx, z: row.bz },
    });
  }

  return hallways;
}

function buildHallwayAdjacency(hallways: HallwaySegment[]): Array<Array<{ to: number; cost: number; connector: Vec2 }>> {
  const graph: Array<Array<{ to: number; cost: number; connector: Vec2 }>> =
    hallways.map(() => []);

  for (let i = 0; i < hallways.length; i += 1) {
    for (let j = i + 1; j < hallways.length; j += 1) {
      const left = hallways[i];
      const right = hallways[j];
      const closest = closestPointsBetweenSegments(left.a, left.b, right.a, right.b);
      const dist = Math.sqrt(closest.distanceSq);

      if (dist > HALLWAY_CONNECT_THRESHOLD) {
        continue;
      }

      const connector = midpoint(closest.pointA, closest.pointB);
      const cost = dist;

      graph[i].push({ to: j, cost, connector });
      graph[j].push({ to: i, cost, connector });
    }
  }

  return graph;
}

function dijkstra(
  graph: Array<Array<{ to: number; cost: number; connector: Vec2 }>>,
  startIndex: number,
  endIndex: number
): { pathIndices: number[]; connectors: Vec2[]; cost: number } | null {
  const size = graph.length;
  const dist = new Array<number>(size).fill(Number.POSITIVE_INFINITY);
  const prev = new Array<number>(size).fill(-1);
  const visited = new Array<boolean>(size).fill(false);
  const prevConnector = new Array<Vec2 | null>(size).fill(null);

  dist[startIndex] = 0;

  for (let step = 0; step < size; step += 1) {
    let current = -1;
    let best = Number.POSITIVE_INFINITY;

    for (let i = 0; i < size; i += 1) {
      if (visited[i]) continue;
      if (dist[i] < best) {
        best = dist[i];
        current = i;
      }
    }

    if (current === -1) break;
    if (current === endIndex) break;

    visited[current] = true;

    for (const edge of graph[current]) {
      const nextDist = dist[current] + edge.cost;
      if (nextDist < dist[edge.to]) {
        dist[edge.to] = nextDist;
        prev[edge.to] = current;
        prevConnector[edge.to] = edge.connector;
      }
    }
  }

  if (!Number.isFinite(dist[endIndex])) {
    return null;
  }

  const pathIndices: number[] = [];
  const connectors: Vec2[] = [];
  let cursor = endIndex;

  while (cursor !== -1) {
    pathIndices.push(cursor);
    const connector = prevConnector[cursor];
    if (connector) {
      connectors.push(connector);
    }
    cursor = prev[cursor];
  }

  pathIndices.reverse();
  connectors.reverse();

  return {
    pathIndices,
    connectors,
    cost: dist[endIndex],
  };
}

export function computeFlowAPath(request: FlowARequest): FlowAResult {
  const rows = request.rows ?? (LANDMARK_ROWS_DATA as LandmarkRow[]);

  if (request.currentFloor !== request.destination.floor_id) {
    return {
      ok: false,
      reason: 'destination-on-different-floor',
      points: [],
      segments: [],
    };
  }

  const destinationAnchor = resolveDestinationAnchor(rows, request.destination);
  if (!destinationAnchor) {
    return {
      ok: false,
      reason: 'destination-anchor-not-found',
      points: [],
      segments: [],
    };
  }

  const hallways = buildHallwaySegments(rows, request.currentFloor);
  if (hallways.length === 0) {
    return {
      ok: false,
      reason: 'no-hallway-on-floor',
      points: [],
      segments: [],
    };
  }

  const graph = buildHallwayAdjacency(hallways);

  let bestStartIndex = -1;
  let bestEndIndex = -1;
  let bestStartProjection: ProjectionResult | null = null;
  let bestEndProjection: ProjectionResult | null = null;
  let bestConnectors: Vec2[] = [];
  let bestTotalCost = Number.POSITIVE_INFINITY;

  for (let startIndex = 0; startIndex < hallways.length; startIndex += 1) {
    const startHallway = hallways[startIndex];
    const startProjection = projectPointToSegment(
      request.currentPosition,
      startHallway.a,
      startHallway.b
    );
    const startCost = Math.sqrt(startProjection.distanceSq);

    for (let endIndex = 0; endIndex < hallways.length; endIndex += 1) {
      const endHallway = hallways[endIndex];
      const endProjection = projectPointToSegment(
        destinationAnchor,
        endHallway.a,
        endHallway.b
      );
      const endCost = Math.sqrt(endProjection.distanceSq);

      let hallwayCost = 0;
      let hallwayConnectors: Vec2[] = [];

      if (startIndex !== endIndex) {
        const route = dijkstra(graph, startIndex, endIndex);
        if (!route) {
          continue;
        }
        hallwayCost = route.cost;
        hallwayConnectors = route.connectors;
      }

      const totalCost = startCost + hallwayCost + endCost;
      if (totalCost < bestTotalCost) {
        bestTotalCost = totalCost;
        bestStartIndex = startIndex;
        bestEndIndex = endIndex;
        bestStartProjection = startProjection;
        bestEndProjection = endProjection;
        bestConnectors = hallwayConnectors;
      }
    }
  }

  if (
    bestStartIndex < 0 ||
    bestEndIndex < 0 ||
    !bestStartProjection ||
    !bestEndProjection
  ) {
    return {
      ok: false,
      reason: 'hallway-route-not-found',
      points: [],
      segments: [],
    };
  }

  const points: Vec2[] = [
    request.currentPosition,
    bestStartProjection.point,
    ...bestConnectors,
    bestEndProjection.point,
    destinationAnchor,
  ];

  const dedupedPoints: Vec2[] = [];
  for (const point of points) {
    const prevPoint = dedupedPoints[dedupedPoints.length - 1];
    if (!prevPoint || distanceSq(prevPoint, point) > 0.000001) {
      dedupedPoints.push(point);
    }
  }

  const segments: FlowASegment[] = [];
  if (dedupedPoints.length >= 2) {
    segments.push({
      kind: 'to_hallway',
      from: dedupedPoints[0],
      to: dedupedPoints[1],
    });

    for (let i = 1; i < dedupedPoints.length - 2; i += 1) {
      segments.push({
        kind: 'hallway',
        from: dedupedPoints[i],
        to: dedupedPoints[i + 1],
      });
    }

    segments.push({
      kind: 'to_destination',
      from: dedupedPoints[dedupedPoints.length - 2],
      to: dedupedPoints[dedupedPoints.length - 1],
    });
  }

  return {
    ok: true,
    points: dedupedPoints,
    segments,
    startHallwayNodeId: hallways[bestStartIndex].nodeId,
    endHallwayNodeId: hallways[bestEndIndex].nodeId,
  };
}
