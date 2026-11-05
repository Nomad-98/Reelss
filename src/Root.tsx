import {Composition} from 'remotion';
import {FoldingDoorReel, REEL_DURATION_IN_FRAMES} from './FoldingDoorReel';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FoldingDoorReel"
      component={FoldingDoorReel}
      durationInFrames={REEL_DURATION_IN_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
