import React from 'react';
import {colors} from '../theme';

type Props = {
  variant: 'swing' | 'fold';
  /** 0..1 animation progress. */
  progress: number;
  opening?: number;
};

const WALL = 26;

/** Top-down sketch of a doorway: a swinging leaf with its arc, or a folding door stacking to one side. */
export const FloorPlan: React.FC<Props> = ({variant, progress, opening = 520}) => {
  const p = Math.min(1, Math.max(0, progress));
  const w = opening + 400;
  const h = opening + 120;
  const hingeX = 200;
  const wallY = h - 60;

  let leaf: React.ReactNode;
  if (variant === 'swing') {
    const angle = p * (Math.PI / 2);
    const endX = hingeX + Math.cos(angle) * opening;
    const endY = wallY - Math.sin(angle) * opening;
    const arcLen = (Math.PI / 2) * opening;
    leaf = (
      <>
        <path
          d={`M ${hingeX + opening} ${wallY} A ${opening} ${opening} 0 0 0 ${hingeX} ${wallY - opening}`}
          fill="none"
          stroke={colors.alert}
          strokeWidth={8}
          strokeDasharray={`${arcLen}`}
          strokeDashoffset={arcLen * (1 - p)}
          strokeLinecap="round"
        />
        <path
          d={`M ${hingeX} ${wallY} L ${hingeX + opening} ${wallY} A ${opening} ${opening} 0 0 0 ${hingeX} ${wallY - opening} Z`}
          fill={colors.alert}
          opacity={0.18 * p}
        />
        <line x1={hingeX} y1={wallY} x2={endX} y2={endY} stroke={colors.cream} strokeWidth={16} strokeLinecap="round" />
      </>
    );
  } else {
    const panels = 4;
    const panelLen = opening / panels;
    const theta = p * ((80 * Math.PI) / 180);
    const pts: [number, number][] = [[hingeX, wallY]];
    for (let i = 1; i <= panels; i++) {
      const dir = i % 2 === 1 ? -1 : 0;
      pts.push([hingeX + i * panelLen * Math.cos(theta), wallY + dir * panelLen * Math.sin(theta)]);
    }
    leaf = (
      <polyline
        points={pts.map((pt) => pt.join(',')).join(' ')}
        fill="none"
        stroke={colors.accent}
        strokeWidth={16}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill="url(#grid)" />
      <rect x={0} y={wallY - WALL / 2} width={hingeX - 10} height={WALL} fill={colors.cream} />
      <rect x={hingeX + opening + 10} y={wallY - WALL / 2} width={w - hingeX - opening - 10} height={WALL} fill={colors.cream} />
      {leaf}
      <circle cx={hingeX} cy={wallY} r={12} fill={colors.cream} />
    </svg>
  );
};
