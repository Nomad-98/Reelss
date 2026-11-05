# Reelss

Remotion project for short vertical reels. Remotion agent skills are installed in `.claude/skills/` (via `npx skills add remotion-dev/skills`).

## Folding door reel

`src/FoldingDoorReel.tsx` — 15 s, 1080×1920, 30 fps Instagram reel:

1. Hook: "Is your door eating your space?" (swing-door floor plan)
2. Fast cuts: Meet the folding door → It folds open → Panel by panel → Folds to the side → Open. / Closed. / Open.
3. "Picture it in your home"
4. CTA: "Want one for your space?" · "Send us a message" · "Follow for more ideas"

The copy contains no product claims, prices or contact details. Captions are auto-fitted with
`fitText()` inside an Instagram-safe zone (x 90–920, clear of the right-hand action buttons and bottom caption area).

Rendered output: `out/folding-door-reel.mp4`

## Commands

```bash
npm install
npm run dev        # Remotion Studio
npm run render     # renders out/folding-door-reel.mp4
```

If Remotion can't download its headless browser (restricted network), pass a local one:
`npx remotion render FoldingDoorReel out/folding-door-reel.mp4 --browser-executable=/path/to/chrome-headless-shell`

Fonts (Anton, Inter — SIL OFL) are bundled in `public/fonts/` so rendering works offline.
