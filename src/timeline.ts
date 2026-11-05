// All timings in frames at 30 fps. Scene cuts are placed on the voiceover's
// phrase boundaries (measured from public/audio/vo/*.wav).
export const FPS = 30;

export const SCENES = {
  hook: {from: 0, dur: 51},
  meet: {from: 51, dur: 36},
  folds: {from: 87, dur: 27},
  closeup: {from: 114, dur: 30},
  side: {from: 144, dur: 42},
  open1: {from: 186, dur: 16},
  closed: {from: 202, dur: 17},
  open2: {from: 219, dur: 19},
  home: {from: 238, dur: 38},
  cta: {from: 276, dur: 174},
} as const;

export const REEL_DURATION_IN_FRAMES = SCENES.cta.from + SCENES.cta.dur; // 450 = 15 s

/** Voiceover clips: absolute start frame and length in frames. */
export const VO = [
  {file: 'vo1.wav', at: 4, len: 39}, // Is your door eating your space?
  {file: 'vo2.wav', at: 53, len: 29}, // Meet the folding door.
  {file: 'vo3.wav', at: 89, len: 51}, // It folds open, panel by panel,
  {file: 'vo4.wav', at: 146, len: 38}, // and folds right to the side.
  {file: 'vo5.wav', at: 188, len: 47}, // Open. Closed. Open.
  {file: 'vo6.wav', at: 240, len: 32}, // Picture it in your home.
  {file: 'vo7.wav', at: 280, len: 65}, // Want one for your space? Send us a message.
];

/** Frame (absolute) where "Send us a message" is spoken. */
export const CTA_BUTTON_AT = 316;

export const SFX: {file: string; at: number; volume: number}[] = [
  {file: 'impact.wav', at: 0, volume: 0.55},
  {file: 'whoosh-a.wav', at: 46, volume: 0.6},
  {file: 'whoosh-b.wav', at: 83, volume: 0.5},
  {file: 'whoosh-a.wav', at: 110, volume: 0.5},
  {file: 'whoosh-b.wav', at: 140, volume: 0.55},
  {file: 'tick.wav', at: 186, volume: 0.5},
  {file: 'tick.wav', at: 202, volume: 0.5},
  {file: 'tick.wav', at: 219, volume: 0.5},
  {file: 'whoosh-a.wav', at: 233, volume: 0.55},
  {file: 'whoosh-b.wav', at: 272, volume: 0.55},
  {file: 'riser.wav', at: CTA_BUTTON_AT - 39, volume: 0.3},
  {file: 'impact.wav', at: CTA_BUTTON_AT, volume: 0.6},
];
