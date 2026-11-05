import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Caption} from './components/Caption';
import {BloomFilterDefs, Grain, LightLeak, ProgressBar, TopShade, Vignette} from './components/Overlays';
import {Scene} from './components/Scene';
import {Soundtrack} from './components/Soundtrack';
import {colors, fonts, SAFE, SAFE_WIDTH} from './theme';
import {CameraPose, DoorWorld, Mood, Vec3} from './three/DoorWorld';
import {CTA_BUTTON_AT, REEL_DURATION_IN_FRAMES, SCENES} from './timeline';

export {REEL_DURATION_IN_FRAMES};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.inOut(Easing.cubic);

const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Camera move from pose A to pose B over the scene, eased. */
const move = (frame: number, dur: number, a: CameraPose, b: CameraPose, easing = Easing.out(Easing.cubic)): CameraPose => {
  const t = interpolate(frame, [0, dur], [0, 1], {...clamp, easing});
  return {
    position: mix(a.position, b.position, t),
    target: mix(a.target, b.target, t),
    fov: a.fov + (b.fov - a.fov) * t,
    roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * t,
  };
};

/** Orbit around the doorway at a given radius/height. */
const orbit = (deg: number, radius: number, height: number, target: Vec3, fov: number): CameraPose => {
  const r = (deg * Math.PI) / 180;
  return {position: [Math.sin(r) * radius, height, Math.cos(r) * radius], target, fov};
};

/** 3D layer with bloom applied. */
const World: React.FC<{openness: number; camera: CameraPose; glow?: number; mood?: Mood; variant?: 'fold' | 'swing'; style?: React.CSSProperties}> = ({
  style,
  ...props
}) => (
  <AbsoluteFill style={{filter: 'url(#bloom)', ...style}}>
    <DoorWorld {...props} />
  </AbsoluteFill>
);

/* ---------------------------------- scenes --------------------------------- */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const shake = interpolate(frame, [0, 10], [1, 0], clamp);
  const cam = move(
    frame,
    d,
    {position: [1.1, 5.6, 4.4], target: [0.1, 0, -0.9], fov: 44},
    {position: [0.7, 5.0, 3.7], target: [0, 0, -0.8], fov: 42},
  );
  cam.position = [cam.position[0] + Math.sin(frame * 2.1) * 0.05 * shake, cam.position[1] + Math.cos(frame * 2.7) * 0.05 * shake, cam.position[2]];
  return (
    <Scene
      enter={false}
      overlay={
        <Caption
          centerY={500}
          start={4}
          duration={36}
          instantWords={3}
          lines={[{text: 'Is your door'}, {text: 'eating your', color: colors.accent, glow: colors.accent}, {text: 'space?', color: colors.alert, glow: colors.alert, maxFontSize: 210}]}
        />
      }
    >
      <World
        variant="swing"
        mood="night"
        glow={0.7}
        openness={interpolate(frame, [0, 30], [0.32, 1], {...clamp, easing: Easing.out(Easing.cubic)})}
        camera={cam}
      />
      <TopShade opacity={0.7} />
    </Scene>
  );
};

const MeetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <Scene
      overlay={
        <Caption
          centerY={470}
          start={2}
          duration={22}
          lines={[{text: 'Meet the'}, {text: 'folding door', color: colors.accent, glow: colors.accent}]}
        />
      }
    >
      <World
        openness={0}
        glow={1.1}
        camera={move(frame, d, {position: [0, 0.7, 7.2], target: [0, 1.75, 0], fov: 40}, {position: [0, 0.85, 5.0], target: [0, 1.65, 0], fov: 38})}
      />
      <TopShade />
    </Scene>
  );
};

const FoldsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 27], [0, 1], {...clamp, easing: smooth});
  return (
    <Scene overlay={<Caption centerY={470} start={2} duration={18} lines={[{text: 'It folds'}, {text: 'open', color: colors.accent, glow: colors.accent}]} />}>
      <World
        openness={interpolate(frame, [1, 25], [0, 0.92], {...clamp, easing: smooth})}
        glow={interpolate(frame, [0, 25], [0.5, 1.5], clamp)}
        camera={orbit(38 - 22 * t, 4.9 - 0.6 * t, 1.6, [0, 1.6, 0.2], 40)}
      />
      <TopShade />
    </Scene>
  );
};

const CloseupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <Scene overlay={<Caption centerY={460} start={1} duration={20} lines={[{text: 'Panel'}, {text: 'by panel', color: colors.accent, glow: colors.accent}]} />}>
      <World
        openness={interpolate(frame, [0, d], [0.35, 0.62], clamp)}
        glow={1.2}
        camera={move(frame, d, {position: [1.6, 0.8, 2.9], target: [-0.3, 1.45, 0.2], fov: 38}, {position: [1.15, 0.9, 2.3], target: [-0.35, 1.4, 0.2], fov: 36})}
      />
      <TopShade opacity={0.75} />
    </Scene>
  );
};

const SideScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <Scene overlay={<Caption centerY={470} start={2} duration={30} lines={[{text: 'Folds to'}, {text: 'the side', color: colors.accent, glow: colors.accent}]} />}>
      <World
        openness={interpolate(frame, [3, 34], [0, 1], {...clamp, easing: smooth})}
        glow={1.7}
        camera={move(frame, d, {position: [0, 6.4, 2.4], target: [0, 0, -1.1], fov: 40, roll: 0.1}, {position: [0, 5.6, 2.0], target: [0, 0, -1.0], fov: 40, roll: -0.04}, smooth)}
      />
      <TopShade />
    </Scene>
  );
};

const SnapScene: React.FC<{word: string; open: boolean; from: CameraPose; to: CameraPose; color: string}> = ({word, open, from, to, color}) => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <Scene overlay={<Caption centerY={470} start={0} duration={0} lines={[{text: word, color, glow: color, maxFontSize: 240}]} />}>
      <World openness={open ? 1 : 0} glow={open ? 1.6 : 0.5} camera={move(frame, d, from, to)} />
      <TopShade />
    </Scene>
  );
};

const HomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <Scene
      overlay={
        <Caption
          centerY={460}
          start={2}
          duration={26}
          lines={[{text: 'Picture it', color: colors.cream}, {text: 'in your home', color: colors.accent, glow: colors.accent}]}
        />
      }
    >
      <World
        mood="home"
        openness={interpolate(frame, [4, d], [0, 0.85], {...clamp, easing: smooth})}
        glow={0.9}
        camera={move(frame, d, {position: [2.3, 1.7, 6.2], target: [0, 1.5, 0], fov: 42}, {position: [1.4, 1.55, 4.9], target: [0, 1.45, 0], fov: 40}, smooth)}
      />
      <TopShade opacity={0.55} />
    </Scene>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const btnAt = CTA_BUTTON_AT - SCENES.cta.from;
  const buttonIn = spring({frame: frame - btnAt, fps, config: {damping: 13, stiffness: 200}});
  const followIn = spring({frame: frame - btnAt - 14, fps, config: {damping: 200}});
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, frame - btnAt - 12) / 4.5);
  const glowPulse = 0.6 + 0.4 * Math.sin(Math.max(0, frame - btnAt) / 6);
  const t = interpolate(frame, [0, d], [0, 1], clamp);

  return (
    <Scene
      exit={false}
      overlay={
        <>
          <Caption
            centerY={420}
            start={4}
            duration={28}
            lines={[{text: 'Want one for'}, {text: 'your space?', color: colors.accent, glow: colors.accent}]}
          />
          <div
            style={{
              position: 'absolute',
              left: SAFE.left,
              width: SAFE_WIDTH,
              top: 680,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
            }}
          >
            <div
              style={{
                background: colors.accent,
                color: colors.ink,
                fontFamily: fonts.body,
                fontWeight: 800,
                fontSize: 60,
                padding: '32px 60px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                maxWidth: SAFE_WIDTH,
                boxSizing: 'border-box',
                boxShadow: `0 12px 0 #B8891A, 0 0 ${40 + 40 * glowPulse}px ${colors.accent}AA`,
                opacity: interpolate(buttonIn, [0, 0.3], [0, 1], clamp),
                scale: interpolate(buttonIn, [0, 1], [2.2, 1]) * pulse,
              }}
            >
              Send us a message
            </div>
            <div
              style={{
                color: colors.cream,
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 46,
                letterSpacing: 1,
                whiteSpace: 'nowrap',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                opacity: followIn,
                translate: `0 ${interpolate(followIn, [0, 1], [30, 0])}px`,
              }}
            >
              Follow for more ideas
            </div>
          </div>
        </>
      }
    >
      <World
        mood="night"
        openness={interpolate(frame, [0, 50], [0.15, 1], {...clamp, easing: smooth})}
        glow={0.75 + 0.25 * glowPulse * interpolate(frame, [btnAt - 2, btnAt + 4], [0, 1], clamp)}
        camera={orbit(-28 + 40 * t, 6.2 - 0.8 * t, 1.1, [0, 2.75, 0.3], 40)}
        style={{filter: 'url(#bloom) brightness(0.75)'}}
      />
      <TopShade opacity={0.75} />
    </Scene>
  );
};

/* ------------------------------- composition ------------------------------- */

export const FoldingDoorReel: React.FC = () => {
  // Make sure fonts are ready before captions are measured with fitText().
  const [handle] = useState(() => delayRender('Loading fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fonts.waitUntilDone().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  if (!ready) return null;

  const seq = (k: keyof typeof SCENES, name: string, node: React.ReactNode) => (
    <Sequence from={SCENES[k].from} durationInFrames={SCENES[k].dur} name={name}>
      {node}
    </Sequence>
  );

  return (
    <AbsoluteFill style={{backgroundColor: colors.ink}}>
      <BloomFilterDefs />
      {seq('hook', 'Hook', <HookScene />)}
      {seq('meet', 'Meet', <MeetScene />)}
      {seq('folds', 'It folds', <FoldsScene />)}
      {seq('closeup', 'Close-up', <CloseupScene />)}
      {seq('side', 'Top-down', <SideScene />)}
      {seq(
        'open1',
        'Open',
        <SnapScene
          word="Open."
          open
          color={colors.accent}
          from={{position: [-2.6, 1.3, 3.6], target: [0, 1.5, 0], fov: 40}}
          to={{position: [-2.2, 1.35, 3.0], target: [0, 1.5, 0], fov: 40}}
        />,
      )}
      {seq(
        'closed',
        'Closed',
        <SnapScene
          word="Closed."
          open={false}
          color={colors.cream}
          from={{position: [0, 1.1, 4.6], target: [0, 1.6, 0], fov: 40}}
          to={{position: [0, 1.15, 3.9], target: [0, 1.6, 0], fov: 40}}
        />,
      )}
      {seq(
        'open2',
        'Open again',
        <SnapScene
          word="Open."
          open
          color={colors.accent}
          from={{position: [2.8, 0.7, 3.4], target: [0, 1.6, 0], fov: 40}}
          to={{position: [2.3, 0.75, 2.9], target: [0, 1.6, 0], fov: 40}}
        />,
      )}
      {seq('home', 'In your home', <HomeScene />)}
      {seq('cta', 'CTA', <CtaScene />)}

      <LightLeak at={SCENES.meet.from} />
      <LightLeak at={SCENES.home.from} hue="#FFE2A8" />
      <LightLeak at={CTA_BUTTON_AT} duration={20} />
      <Vignette />
      <Grain />
      <ProgressBar />
      <Soundtrack />
    </AbsoluteFill>
  );
};
