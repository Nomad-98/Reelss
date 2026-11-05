import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, interpolate, staticFile} from 'remotion';
import {SFX, VO} from '../timeline';

/** Music bed (ducked under the voiceover), voiceover lines and sound effects. */
export const Soundtrack: React.FC = () => {
  const duck = (f: number) => {
    const speaking = VO.some((v) => f >= v.at - 3 && f <= v.at + v.len + 3);
    return speaking ? 0.16 : 0.32;
  };
  return (
    <>
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) => duck(f) * interpolate(f, [0, 6], [0.4, 1], {extrapolateRight: 'clamp'})}
      />
      {VO.map((v) => (
        <Sequence key={v.file} from={v.at} durationInFrames={v.len + 6} name={`VO ${v.file}`} layout="none">
          <Audio src={staticFile(`audio/vo/${v.file}`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={45} name={`SFX ${s.file}`} layout="none">
          <Audio src={staticFile(`audio/${s.file}`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
