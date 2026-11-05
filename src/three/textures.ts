import * as THREE from 'three';

// Deterministic PRNG so every render produces identical textures.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const finish = (canvas: HTMLCanvasElement) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
};

/** Vertical-grain light oak for the door panels. */
export const makeWoodTexture = (seed = 3) => {
  const rand = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#D7AE7E');
  grad.addColorStop(0.5, '#E3BE90');
  grad.addColorStop(1, '#CFA272');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 26; i++) {
    const x = rand() * 256;
    const w = 1 + rand() * 5;
    g.strokeStyle = `rgba(${110 + rand() * 40},${70 + rand() * 30},${35 + rand() * 20},${0.05 + rand() * 0.09})`;
    g.lineWidth = w;
    g.beginPath();
    let px = x;
    g.moveTo(px, 0);
    for (let y = 0; y <= 1024; y += 32) {
      px += (rand() - 0.5) * 6;
      g.lineTo(px, y);
    }
    g.stroke();
  }
  return finish(c);
};

/** Plank floor. */
export const makeFloorTexture = (base: string, seed = 11) => {
  const rand = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 1024, 1024);
  const plankH = 128;
  for (let row = 0; row < 1024 / plankH; row++) {
    let x = -rand() * 400;
    while (x < 1024) {
      const len = 300 + rand() * 400;
      const l = 0.94 + rand() * 0.12;
      g.fillStyle = `rgba(0,0,0,${(1 - l) * 0.9 + 0.02})`;
      if (l > 1) g.fillStyle = `rgba(255,255,255,${(l - 1) * 0.5})`;
      g.fillRect(x, row * plankH, len, plankH);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(x, row * plankH, 2, plankH);
      x += len;
    }
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(0, row * plankH, 1024, 2);
  }
  const tex = finish(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  return tex;
};

/** Warm, softly lit room seen through the doorway (bright centre, amber falloff). */
export const makeInteriorTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(300, 210, 10, 300, 230, 380);
  grad.addColorStop(0, '#FFF3DC');
  grad.addColorStop(0.25, '#FFD08A');
  grad.addColorStop(0.6, '#D9893E');
  grad.addColorStop(1, '#5A2E14');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  // window-like soft light shape
  g.fillStyle = 'rgba(255,255,240,0.35)';
  g.fillRect(250, 120, 110, 160);
  g.fillStyle = 'rgba(90,50,20,0.5)';
  g.fillRect(302, 120, 6, 160);
  g.fillRect(250, 196, 110, 6);
  return finish(c);
};
