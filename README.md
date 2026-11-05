# Reelss

Remotion project for short vertical reels. Remotion agent skills are installed in `.claude/skills/` (via `npx skills add remotion-dev/skills`).

## Folding door reel

`src/FoldingDoorReel.tsx`: a 15 s, 1080×1920, 30 fps Instagram reel. Output: `out/folding-door-reel.mp4`.

| Time | Shot | Caption / voiceover |
| --- | --- | --- |
| 0.0 s | Top-down swing door with a glowing red sweep zone (hook) | "Is your door eating your space?" |
| 1.7 s | Low hero dolly-in on the closed folding door | "Meet the folding door." |
| 2.9 s | Orbit while the panels fold, light spills out | "It folds open," |
| 3.8 s | Close-up on the folded panels | "panel by panel," |
| 4.8 s | Overhead: door stacks to the side, light pool on the floor | "and folds right to the side." |
| 6.2 s | Three fast cuts from different angles | "Open. Closed. Open." |
| 7.9 s | Wide shot in a lived-in room | "Picture it in your home." |
| 9.2 s | CTA with slow orbit | "Want one for your space? Send us a message." |

The copy makes no product claims, prices or contact details.

**Visuals**: real 3D door (Three.js via `@remotion/three`) with hinged panels, shadows, a backlit room and moving cameras. On top: bloom (SVG filter), light leaks, vignette, film grain, zoom-blur whip transitions, and 3D flip-in captions with neon glow, auto-fitted with `fitText()` inside the Instagram safe zone (x 90–920).

**Audio**: voiceover lines in `public/audio/vo/`, a 120 BPM music bed (ducked under the voice), whooshes on cuts, ticks on the snap cuts, a riser and impact into the CTA. Every sound is synthesised by `scripts/generate_sfx.py`, so there are no third-party samples. Timings are in `src/timeline.ts`.

## Commands

```bash
npm install
npm run dev        # Remotion Studio
npm run render     # renders out/folding-door-reel.mp4
python3 scripts/generate_sfx.py         # regenerate music + SFX (numpy, scipy)
scripts/generate_voiceover.sh           # regenerate the voiceover (Piper TTS)
```

WebGL uses the software `swangle` renderer (set in `remotion.config.ts`) so renders work headless. If Remotion can't download its headless browser, pass a local one with `--browser-executable=/path/to/chrome-headless-shell`.

## Swapping in your own voice

Replace `public/audio/vo/vo1.wav` … `vo7.wav` with your own recordings, keeping the same file names. Then update the `at`/`len` values in `src/timeline.ts`.

## Credits

- Voice: [Piper](https://github.com/rhasspy/piper) TTS, `en_US-libritts-high` voice trained on [LibriTTS](http://www.openslr.org/60/) (CC BY 4.0).
- Fonts: Anton and Inter (SIL Open Font License), bundled in `public/fonts/`.
