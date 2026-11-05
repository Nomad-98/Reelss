import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const ANTON = 'Anton';
const INTER = 'Inter';

const loaded = Promise.all([
  loadFont({family: ANTON, url: staticFile('fonts/Anton-Regular.woff2'), weight: '400'}),
  loadFont({family: INTER, url: staticFile('fonts/Inter-Variable-Latin.woff2'), weight: '100 900'}),
]);

export const fonts = {
  display: ANTON,
  body: INTER,
  waitUntilDone: () => loaded,
};

export const colors = {
  ink: '#111111',
  charcoal: '#1C1C1E',
  cream: '#F4EFE6',
  accent: '#FFC93C',
  alert: '#FF4D3D',
  wood: '#C89B6D',
  woodDark: '#8E643F',
  woodLight: '#E2BE92',
  wall: '#E9E2D6',
  sage: '#9DB39A',
};

// Instagram Reels UI overlays the bottom (caption, audio) and right edge
// (like/comment/share). Keep all text inside this box.
export const SAFE = {
  left: 90,
  right: 1080 - 160,
  top: 220,
  bottom: 1920 - 420,
};
export const SAFE_WIDTH = SAFE.right - SAFE.left;
