import {fitText} from '@remotion/layout-utils';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, SAFE, SAFE_WIDTH} from '../theme';

export type CaptionLine = {
  text: string;
  color?: string;
  /** Cap the auto-fitted size so short words don't get absurdly large. */
  maxFontSize?: number;
};

type Props = {
  lines: CaptionLine[];
  /** Vertical centre of the caption block, in px. */
  centerY?: number;
  /** Frames between each word popping in. */
  stagger?: number;
  delay?: number;
  /** Show the first words fully formed on frame 0 (for the hook / thumbnail). */
  instant?: boolean;
};

const LETTER_SPACING = 2;
// Leave room for the text stroke and pop-in overshoot.
const FIT_WIDTH = SAFE_WIDTH - 60;

export const Caption: React.FC<Props> = ({lines, centerY = 560, stagger = 3, delay = 0, instant = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  let wordIndex = 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE_WIDTH,
        top: centerY,
        translate: '0 -50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {lines.map((line, lineIdx) => {
        const fitted = fitText({
          text: line.text,
          withinWidth: FIT_WIDTH,
          fontFamily: fonts.display,
          fontWeight: '400',
          letterSpacing: `${LETTER_SPACING}px`,
          textTransform: 'uppercase',
        }).fontSize;
        const fontSize = Math.floor(Math.min(fitted, line.maxFontSize ?? 190));
        const words = line.text.split(' ');

        return (
          <div
            key={lineIdx}
            style={{
              fontFamily: fonts.display,
              fontSize,
              lineHeight: 1.02,
              letterSpacing: LETTER_SPACING,
              textTransform: 'uppercase',
              color: line.color ?? colors.cream,
              // Real spaces between words so the rendered width matches fitText().
              whiteSpace: 'pre',
              WebkitTextStroke: `${Math.max(4, fontSize * 0.04)}px ${colors.ink}`,
              paintOrder: 'stroke fill',
              textShadow: `0 ${fontSize * 0.06}px 0 ${colors.ink}`,
            }}
          >
            {words.map((word, i) => {
              const start = (instant ? -12 : 0) + delay + wordIndex++ * stagger;
              const pop = spring({
                frame: frame - start,
                fps,
                config: {damping: 12, stiffness: 260, mass: 0.6},
              });
              return (
                <React.Fragment key={i}>
                {i > 0 ? ' ' : null}
                <span
                  style={{
                    display: 'inline-block',
                    opacity: interpolate(frame - start, [0, 2], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    scale: interpolate(pop, [0, 1], [0.55, 1]),
                    translate: `0 ${interpolate(pop, [0, 1], [50, 0])}px`,
                  }}
                >
                  {word}
                </span>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
