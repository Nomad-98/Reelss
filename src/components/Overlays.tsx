import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';

/**
 * SVG filter that adds bloom: bright pixels are isolated, blurred and screened
 * back over the image. Apply with `filter: url(#bloom)`.
 */
export const BloomFilterDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="bloom" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feComponentTransfer in="SourceGraphic" result="bright">
          <feFuncR type="linear" slope={2.6} intercept={-1.55} />
          <feFuncG type="linear" slope={2.6} intercept={-1.55} />
          <feFuncB type="linear" slope={2.6} intercept={-1.55} />
        </feComponentTransfer>
        <feGaussianBlur in="bright" stdDeviation={28} result="glow" />
        <feBlend in="SourceGraphic" in2="glow" mode="screen" />
      </filter>
    </defs>
  </svg>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Darkens the top of frame so captions read over any background. */
export const TopShade: React.FC<{opacity?: number}> = ({opacity = 0.6}) => (
  <AbsoluteFill
    style={{background: `linear-gradient(180deg, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.6}) 30%, rgba(0,0,0,0) 48%)`}}
  />
);

/** Animated film grain (seeded per frame, deterministic). */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Warm light-leak sweep, used over big cuts. */
export const LightLeak: React.FC<{at: number; duration?: number; hue?: string}> = ({at, duration = 16, hue = colors.accent}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at - duration / 2, at + duration / 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0 || p >= 1) return null;
  const strength = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: strength * 0.85,
        background: `radial-gradient(ellipse 60% 45% at ${interpolate(p, [0, 1], [-10, 110])}% ${interpolate(p, [0, 1], [20, 70])}%, ${hue} 0%, #FF7A2F88 35%, rgba(0,0,0,0) 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: 10,
        width: `${(frame / (durationInFrames - 1)) * 100}%`,
        background: colors.accent,
        boxShadow: `0 0 18px ${colors.accent}`,
      }}
    />
  );
};
