import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import LANDMARK_ROWS_DATA from '../data/landmark_rows.json';

interface HallwayRow {
  node_id: number;
  floor_id: number;
  type: string;
  ax?: number;
  az?: number;
  bx?: number;
  bz?: number;
}

interface HallwaySegmentsProps {
  floor: number;
}

const HALLWAY_LINE_Y = 0.15;
const ENABLE_HALLWAY_SEGMENTS = false;

export default function HallwaySegments({ floor }: HallwaySegmentsProps) {
  const segments = useMemo(() => {
    const rows = LANDMARK_ROWS_DATA as HallwayRow[];
    return rows.filter((row) => {
      if (row.floor_id !== floor) return false;
      if (row.type.toLowerCase() !== 'hallway') return false;

      const hasValidEndpoints =
        Number.isFinite(row.ax) &&
        Number.isFinite(row.az) &&
        Number.isFinite(row.bx) &&
        Number.isFinite(row.bz);

      return hasValidEndpoints;
    });
  }, [floor]);

  if (!ENABLE_HALLWAY_SEGMENTS) {
    return null;
  }

  return (
    <group>
      {segments.map((segment) => (
        <Line
          key={`hallway-segment-${segment.node_id}`}
          points={[
            [segment.ax as number, HALLWAY_LINE_Y, segment.az as number],
            [segment.bx as number, HALLWAY_LINE_Y, segment.bz as number],
          ]}
          color="#14b8a6"
          lineWidth={2}
        />
      ))}
    </group>
  );
}
