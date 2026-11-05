"""Synthesise the reel's sound design (no third-party samples, no licensing).

Writes to public/audio/:
  whoosh-a.wav, whoosh-b.wav  - filtered-noise swooshes for cuts
  impact.wav                  - sub drop + transient for big hits
  riser.wav                   - rising noise/tone into the CTA
  tick.wav                    - short click for the snap cuts
  music.wav                   - 15 s, 120 BPM electronic bed

Usage: python scripts/generate_sfx.py   (needs numpy + scipy)
"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def write(name, x, stereo_width=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    if stereo_width:
        d = int(SR * 0.012)
        r = np.concatenate([np.zeros(d), x[:-d]])
        x = np.stack([x, (1 - stereo_width) * x + stereo_width * r], axis=1)
    wavfile.write(os.path.join(OUT, name), SR, (x * 32767).astype(np.int16))


def sweep_filter(noise, f0, f1, q=2.0, blocks=64):
    out = np.zeros_like(noise)
    n = len(noise)
    for b in range(blocks):
        s, e = b * n // blocks, (b + 1) * n // blocks
        f = f0 * (f1 / f0) ** (b / blocks)
        lo, hi = max(40, f / q), min(SR / 2 - 100, f * q)
        sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        out[s:e] = sosfilt(sos, noise[s:e])
    return out


def whoosh(dur, f0, f1, peak=0.6):
    tt = t(dur)
    n = rng.standard_normal(len(tt))
    x = sweep_filter(n, f0, f1)
    env = np.where(tt < dur * peak, (tt / (dur * peak)) ** 2, ((dur - tt) / (dur * (1 - peak))) ** 1.5)
    return x * env


def impact():
    tt = t(1.2)
    f = 70 * np.exp(-tt * 3) + 32
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 60)
    body = sosfilt(butter(2, 900, fs=SR, output="sos"), rng.standard_normal(len(tt))) * np.exp(-tt * 9)
    return sub * 1.0 + click * 0.25 + body * 0.5


def riser():
    dur = 1.3
    tt = t(dur)
    n = sweep_filter(rng.standard_normal(len(tt)), 300, 7000, q=1.6)
    tone = np.sin(2 * np.pi * np.cumsum(220 * (4 ** (tt / dur))) / SR) * 0.25
    env = (tt / dur) ** 2.2
    return (n + tone) * env


def tick():
    tt = t(0.08)
    return np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 90) + rng.standard_normal(len(tt)) * np.exp(-tt * 200) * 0.4


def music(dur=15.0, bpm=120):
    beat = 60 / bpm
    n = int(SR * dur)
    mix = np.zeros(n)
    side = np.ones(n)  # sidechain envelope

    def place(sig, at, gain=1.0):
        s = int(at * SR)
        e = min(n, s + len(sig))
        if s < n:
            mix[s:e] += sig[: e - s] * gain

    kt = t(0.45)
    kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-kt * 30)) / SR) * np.exp(-kt * 7)
    ct = t(0.25)
    clap = sosfilt(butter(2, [900, 4000], btype="band", fs=SR, output="sos"), rng.standard_normal(len(ct))) * np.exp(-ct * 18)
    ht = t(0.05)
    hat = sosfilt(butter(2, 7000, btype="high", fs=SR, output="sos"), rng.standard_normal(len(ht))) * np.exp(-ht * 70)

    # A minor -> F -> C -> G, one chord per bar
    roots = [55.0, 43.65, 65.41, 49.0]
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
    bars = int(np.ceil(dur / (beat * 4)))
    for bar in range(bars):
        b0 = bar * beat * 4
        ci = bar % 4
        for k in range(4):
            at = b0 + k * beat
            place(kick, at, 0.9)
            s = int(at * SR)
            dk = np.minimum(1, 0.35 + t(beat)[: max(0, min(n, s + int(beat * SR)) - s)] / (beat * 0.6))
            side[s : s + len(dk)] = dk
            if k in (1, 3):
                place(clap, at, 0.35)
        for k in range(8):
            place(hat, b0 + k * beat / 2 + beat / 4, 0.18)
        bt = t(beat * 4)
        bass = np.sign(np.sin(2 * np.pi * roots[ci] * bt)) * 0.5 + np.sin(2 * np.pi * roots[ci] * bt)
        bass = sosfilt(butter(2, 300, fs=SR, output="sos"), bass)
        pad = sum(np.sin(2 * np.pi * f * bt) + 0.3 * np.sin(2 * np.pi * 2 * f * bt + 0.3) for f in chords[ci])
        pad *= np.minimum(1, bt / 0.15) * np.minimum(1, (beat * 4 - bt) / 0.15)
        s = int(b0 * SR)
        e = min(n, s + len(bt))
        mix[s:e] += (bass[: e - s] * 0.35 + pad[: e - s] * 0.06) * side[s:e]

    fade = np.minimum(1, (dur - t(dur)) / 0.6)
    return mix * fade


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write("whoosh-a.wav", whoosh(0.45, 400, 5000), 0.6)
    write("whoosh-b.wav", whoosh(0.35, 3000, 300, peak=0.4), 0.6)
    write("impact.wav", impact())
    write("riser.wav", riser(), 0.5)
    write("tick.wav", tick())
    write("music.wav", music(), 0.3)
    print("wrote", sorted(os.listdir(OUT)))
