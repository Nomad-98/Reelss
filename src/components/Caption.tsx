import {fitText} from '@remotion/layout-utils';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, SAFE, SAFE_WIDTH} from '../theme';

export type CaptionLine = {
  text: string;
  color?: string;
  /** Neon glow in this colour. */
  glow?: string;
  maxFontSize?: number;
};

type Props = {
  lines: CaptionLine[];
  /** Vertical centre of the caption block, in px. */
  centerY?: number;
  /** Frame (scene-relative) the first word lands; words are spread over `duration` to follow the voiceover. */
  start?: number;
  duration?: number;
  /** Number of leading words already on screen at frame 0 (hook / thumbnail). */
  instantWords?: number;
};

const LETTER_SPACING = 2;
// Leave room for the stroke, glow and pop-in overshoot.
const FIT_WIDTH = SAFE_WIDTH - 60;

export const Caption: React.FC<Props> = ({lines, centerY = 520, start = 0, duration = 20, instantWords = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const totalWords = lines.reduce((n, l) => n + l.text.split(' ').length, 0);
  const step = totalWords > 1 ? duration / totalWords : 0;

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
        gap: 2,
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
        const shadow = [
          line.glow ? `0 0 ${fontSize * 0.18}px ${line.glow}` : null,
          line.glow ? `0 0 ${fontSize * 0.45}px ${line.glow}AA` : null,
          `0 ${fontSize * 0.06}px 0 ${colors.ink}`,
        ]
          .filter(Boolean)
          .join(', ');

        return (
          <div
            key={lineIdx}
            style={{
              fontFamily: fonts.display,
              fontSize,
              lineHeight: 1.04,
              letterSpacing: LETTER_SPACING,
              textTransform: 'uppercase',
              color: line.color ?? colors.cream,
              // Real spaces between words so the rendered width matches fitText().
              whiteSpace: 'pre',
              WebkitTextStroke: `${Math.max(4, fontSize * 0.04)}px ${colors.ink}`,
              paintOrder: 'stroke fill',
              textShadow: shadow,
              perspective: 900,
            }}
          >
            {words.map((word, i) => {
              const idx = wordIndex++;
              const wStart = idx < instantWords ? -30 : start + Math.round(idx * step);
              const pop = spring({frame: frame - wStart, fps, config: {damping: 11, stiffness: 240, mass: 0.6}});
              return (
                <React.Fragment key={i}>
                  {i > 0 ? ' ' : null}
                  <span
                    style={{
                      display: 'inline-block',
                      opacity: interpolate(frame - wStart, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
                      scale: interpolate(pop, [0, 1], [0.6, 1]),
                      translate: `0 ${interpolate(pop, [0, 1], [60, 0])}px`,
                      rotate: `x ${interpolate(pop, [0, 1], [-75, 0])}deg`,
                      transformOrigin: '50% 100%',
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
