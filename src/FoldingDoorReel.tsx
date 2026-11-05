import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  Series,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Caption} from './components/Caption';
import {FloorPlan} from './components/FloorPlan';
import {FoldingDoor} from './components/FoldingDoor';
import {Scene} from './components/Scene';
import {colors, fonts, SAFE, SAFE_WIDTH} from './theme';

const FPS = 30;
const s = (seconds: number) => Math.round(seconds * FPS);

// Scene lengths (frames). Sum must equal 15 s.
const T = {
  hook: s(1.5),
  meet: s(1.0),
  folds: s(1.5),
  closeup: s(1.0),
  plan: s(1.5),
  open1: s(0.67),
  closed: s(0.67),
  open2: s(0.66),
  home: s(2.0),
  cta: s(4.5),
};
export const REEL_DURATION_IN_FRAMES = Object.values(T).reduce((a, b) => a + b, 0);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Centered: React.FC<{top: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  top,
  children,
  style,
}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', ...style}}>
    {children}
  </div>
);

/* ---------------------------------- scenes --------------------------------- */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene background={colors.charcoal} punch={0} flash={false}>
      <Centered top={820}>
        <FloorPlan variant="swing" progress={interpolate(frame, [0, 30], [0.15, 1], {...clamp, easing: Easing.out(Easing.cubic)})} />
      </Centered>
      <Caption
        centerY={500}
        stagger={2}
        instant
        lines={[{text: 'Is your door'}, {text: 'eating your', color: colors.accent}, {text: 'space?', color: colors.accent}]}
      />
    </Scene>
  );
};

const MeetScene: React.FC = () => (
  <Scene background={colors.accent}>
    <Centered top={820}>
      <FoldingDoor openness={0} width={460} height={760} />
    </Centered>
    <Caption centerY={480} stagger={3} lines={[{text: 'Meet the', color: colors.ink}, {text: 'folding door'}]} />
  </Scene>
);

const FoldsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const openness = interpolate(frame, [4, 36], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <Scene background={colors.ink}>
      <Centered top={820}>
        <FoldingDoor openness={openness} width={460} height={760} />
      </Centered>
      <Caption centerY={480} lines={[{text: 'It folds'}, {text: 'open', color: colors.accent}]} />
    </Scene>
  );
};

const CloseupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const openness = interpolate(frame, [0, 30], [0.25, 0.65], clamp);
  return (
    <Scene background={colors.woodDark} punch={0.15}>
      <Centered top={700} style={{scale: 2.1, transformOrigin: '50% 0%'}}>
        <FoldingDoor openness={openness} width={460} height={760} />
      </Centered>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 45%)'}} />
      <Caption centerY={460} lines={[{text: 'Panel'}, {text: 'by panel', color: colors.accent}]} />
    </Scene>
  );
};

const PlanScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene background={colors.charcoal}>
      <Centered top={820}>
        <FloorPlan variant="fold" progress={interpolate(frame, [4, 34], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)})} />
      </Centered>
      <Caption centerY={500} lines={[{text: 'Folds to'}, {text: 'the side', color: colors.accent}]} />
    </Scene>
  );
};

const SnapScene: React.FC<{word: string; bg: string; text: string; open: boolean}> = ({word, bg, text, open}) => (
  <Scene background={bg} punch={0.12}>
    <Centered top={820}>
      <FoldingDoor openness={open ? 1 : 0} width={460} height={760} />
    </Centered>
    <Caption centerY={470} stagger={0} lines={[{text: word, color: text, maxFontSize: 230}]} />
  </Scene>
);

const HomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const openness = interpolate(frame, [8, 50], [0, 0.85], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <Scene background={colors.wall}>
      {/* Floor */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1568, bottom: 0, background: '#B88B60'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1540, height: 28, background: '#FFFFFF'}} />
      <Centered top={780} style={{scale: interpolate(frame, [0, 60], [1, 1.06], clamp)}}>
        <FoldingDoor openness={openness} width={480} height={760} interior="#3B4A3F" />
      </Centered>
      <Caption centerY={470} lines={[{text: 'Picture it', color: colors.ink}, {text: 'in your home', color: colors.accent}]} />
    </Scene>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const buttonIn = spring({frame: frame - 18, fps, config: {damping: 14, stiffness: 180}});
  const followIn = spring({frame: frame - 30, fps, config: {damping: 200}});
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, frame - 40) / 5);
  const openness = interpolate(frame, [0, 60, 100, 135], [0, 1, 1, 0.4], {...clamp, easing: Easing.inOut(Easing.cubic)});

  return (
    <Scene background={colors.ink}>
      <Centered top={1010} style={{opacity: 0.9}}>
        <FoldingDoor openness={openness} width={380} height={600} />
      </Centered>
      <Caption centerY={430} lines={[{text: 'Want one for'}, {text: 'your space?', color: colors.accent}]} />
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE_WIDTH,
          top: 690,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
        }}
      >
        <div
          style={{
            background: colors.accent,
            color: colors.ink,
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 58,
            padding: '30px 56px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            maxWidth: SAFE_WIDTH,
            boxSizing: 'border-box',
            boxShadow: '0 12px 0 #B8891A',
            opacity: interpolate(buttonIn, [0, 1], [0, 1]),
            scale: interpolate(buttonIn, [0, 1], [0.6, 1]) * pulse,
          }}
        >
          Send us a message
        </div>
        <div
          style={{
            color: colors.cream,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            opacity: followIn,
            translate: `0 ${interpolate(followIn, [0, 1], [30, 0])}px`,
          }}
        >
          Follow for more ideas
        </div>
      </div>
    </Scene>
  );
};

/* ------------------------------- composition ------------------------------- */

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(frame / (durationInFrames - 1)) * 100}%`, background: colors.accent}} />
  );
};

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

  return (
    <AbsoluteFill style={{backgroundColor: colors.ink}}>
      <Series>
        <Series.Sequence durationInFrames={T.hook} name="Hook">
          <HookScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.meet} name="Meet">
          <MeetScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.folds} name="It folds">
          <FoldsScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.closeup} name="Close-up">
          <CloseupScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.plan} name="Floor plan">
          <PlanScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.open1} name="Open">
          <SnapScene word="Open." bg={colors.sage} text={colors.ink} open />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.closed} name="Closed">
          <SnapScene word="Closed." bg={colors.charcoal} text={colors.cream} open={false} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.open2} name="Open again">
          <SnapScene word="Open." bg={colors.accent} text={colors.ink} open />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.home} name="In your home">
          <HomeScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={T.cta} name="CTA">
          <CtaScene />
        </Series.Sequence>
      </Series>
      <ProgressBar />
    </AbsoluteFill>
  );
};
