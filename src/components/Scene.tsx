import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  children: React.ReactNode;
  /** Optional caption/UI layer, kept outside the zoom-blur so text stays crisp. */
  overlay?: React.ReactNode;
  /** Skip the incoming zoom-blur (used on frame 0 so the thumbnail is clean). */
  enter?: boolean;
  exit?: boolean;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Zoom-blur "whip" transition in and out of every cut. */
export const Scene: React.FC<Props> = ({children, overlay, enter = true, exit = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const d = durationInFrames;

  const inScale = enter ? interpolate(frame, [0, 7], [1.28, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const outScale = exit ? interpolate(frame, [d - 4, d], [1, 1.14], {...clamp, easing: Easing.in(Easing.quad)}) : 1;
  const blur = (enter ? interpolate(frame, [0, 6], [18, 0], clamp) : 0) + (exit ? interpolate(frame, [d - 3, d], [0, 14], clamp) : 0);
  const flash = enter ? interpolate(frame, [0, 3], [0.35, 0], clamp) : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={{scale: inScale * outScale, filter: blur > 0.1 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
      {overlay}
      <AbsoluteFill style={{backgroundColor: '#FFF6E6', opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
