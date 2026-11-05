import React from 'react';
import {colors} from '../theme';

type Props = {
  /** 0 = fully closed, 1 = fully folded to the left jamb. */
  openness: number;
  width?: number;
  height?: number;
  panels?: number;
  trim?: string;
  interior?: string;
  style?: React.CSSProperties;
};

type Pt = [number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Bilinear point inside a quad (tl, tr, br, bl). */
const quadPoint = (q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt => {
  const [tl, tr, br, bl] = q;
  const top: Pt = [lerp(tl[0], tr[0], u), lerp(tl[1], tr[1], u)];
  const bottom: Pt = [lerp(bl[0], br[0], u), lerp(bl[1], br[1], u)];
  return [lerp(top[0], bottom[0], v), lerp(top[1], bottom[1], v)];
};

const toPoints = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');

const subQuad = (q: [Pt, Pt, Pt, Pt], u0: number, u1: number, v0: number, v1: number) =>
  toPoints([quadPoint(q, u0, v0), quadPoint(q, u1, v0), quadPoint(q, u1, v1), quadPoint(q, u0, v1)]);

/**
 * Stylised accordion / bi-fold door drawn in SVG. Each panel is a quad whose
 * hinge edges alternate between "near" (full height) and "far" (foreshortened),
 * which reads as panels folding in and out as `openness` increases.
 */
export const FoldingDoor: React.FC<Props> = ({
  openness,
  width = 620,
  height = 1000,
  panels = 4,
  trim = '#F7F3EC',
  interior = '#2B2A33',
  style,
}) => {
  const o = Math.min(1, Math.max(0, openness));
  const theta = (o * 82 * Math.PI) / 180;
  const panelW = (width / panels) * Math.cos(theta);
  const shrink = height * 0.06 * Math.sin(theta);
  const frameT = 34;

  const quads: [Pt, Pt, Pt, Pt][] = Array.from({length: panels}, (_, i) => {
    const xL = i * panelW;
    const xR = (i + 1) * panelW;
    const leftNear = i % 2 === 0;
    const lt = leftNear ? 0 : shrink;
    const rt = leftNear ? shrink : 0;
    return [
      [xL, lt],
      [xR, rt],
      [xR, height - rt],
      [xL, height - lt],
    ];
  });

  return (
    <svg
      width={width + frameT * 2}
      height={height + frameT + 10}
      viewBox={`${-frameT} ${-frameT} ${width + frameT * 2} ${height + frameT + 10}`}
      style={{overflow: 'visible', ...style}}
    >
      <defs>
        <linearGradient id="interior" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={interior} />
          <stop offset="1" stopColor="#14131A" />
        </linearGradient>
        <radialGradient id="glow" cx="0.65" cy="0.35" r="0.7">
          <stop offset="0" stopColor={colors.accent} stopOpacity="0.35" />
          <stop offset="1" stopColor={colors.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.woodLight} />
          <stop offset="1" stopColor={colors.wood} />
        </linearGradient>
      </defs>

      {/* Door frame / trim */}
      <rect x={-frameT} y={-frameT} width={width + frameT * 2} height={height + frameT} rx={6} fill={trim} />
      <rect x={-frameT} y={-frameT} width={width + frameT * 2} height={height + frameT} rx={6} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={3} />

      {/* Room behind the door */}
      <rect x={0} y={0} width={width} height={height} fill="url(#interior)" />
      <rect x={0} y={0} width={width} height={height} fill="url(#glow)" />

      {/* Top track */}
      <rect x={0} y={-6} width={width} height={12} fill="#5A5A60" />

      {quads.map((q, i) => {
        const shade = i % 2 === 0 ? 0.04 * Math.sin(theta) : 0.42 * Math.sin(theta);
        return (
          <g key={i}>
            <polygon points={toPoints(q)} fill="url(#wood)" stroke={colors.woodDark} strokeWidth={3} strokeLinejoin="round" />
            <polygon points={subQuad(q, 0.16, 0.84, 0.05, 0.47)} fill="none" stroke={colors.woodDark} strokeOpacity={0.55} strokeWidth={4} />
            <polygon points={subQuad(q, 0.16, 0.84, 0.53, 0.95)} fill="none" stroke={colors.woodDark} strokeOpacity={0.55} strokeWidth={4} />
            <polygon points={toPoints(q)} fill="#000" opacity={shade} />
          </g>
        );
      })}

      {/* Pull handle on the leading panel */}
      {(() => {
        const q = quads[panels - 1];
        const [hx, hy] = quadPoint(q, 0.86, 0.5);
        const hw = Math.max(4, 14 * Math.cos(theta));
        return <rect x={hx - hw / 2} y={hy - 60} width={hw} height={120} rx={hw / 2} fill="#2E2E33" />;
      })()}

      {/* Floor line */}
      <rect x={-frameT - 200} y={height} width={width + frameT * 2 + 400} height={10} fill="rgba(0,0,0,0.25)" />
    </svg>
  );
};
