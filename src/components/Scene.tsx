import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

type Props = {
  background: string;
  children: React.ReactNode;
  /** Strength of the punch-in zoom on the cut. */
  punch?: number;
  /** Skip the white flash (used on frame 0 so the thumbnail is clean). */
  flash?: boolean;
};

/** Hard cut with a quick flash and zoom punch, used for every scene. */
export const Scene: React.FC<Props> = ({background, children, punch = 0.08, flash = true}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: background, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, 8], [1 + punch, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          }),
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: '#FFFFFF',
          opacity: !flash ? 0 : interpolate(frame, [0, 4], [0.55, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
