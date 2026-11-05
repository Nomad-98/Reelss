#!/usr/bin/env bash
# Regenerates public/audio/vo/vo1..7.wav from scripts/voiceover.txt using Piper TTS
# with the LibriTTS "high" voice (dataset licensed CC BY 4.0), speaker 200.
#
# Requirements: python3, ffmpeg.
# To use your own recorded voiceover instead, replace the WAV files (keep the
# names) and adjust the VO timings in src/timeline.ts.
set -euo pipefail
cd "$(dirname "$0")/.."
WORK=${WORK:-.tts}
mkdir -p "$WORK" public/audio/vo
[ -x "$WORK/venv/bin/piper" ] || { python3 -m venv "$WORK/venv"; "$WORK/venv/bin/pip" install -q piper-tts; }
MODEL="$WORK/libritts/en-us-libritts-high.onnx"
if [ ! -f "$MODEL" ]; then
  curl -sSL -o "$WORK/libritts.tar.gz" https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-libritts-high.tar.gz
  mkdir -p "$WORK/libritts" && tar -xzf "$WORK/libritts.tar.gz" -C "$WORK/libritts"
fi
i=0
while IFS= read -r line; do
  i=$((i + 1))
  echo "$line" | "$WORK/venv/bin/piper" -m "$MODEL" -s 200 --length-scale 0.92 -f "$WORK/raw$i.wav" 2>/dev/null
  ffmpeg -nostdin -y -loglevel error -i "$WORK/raw$i.wav" -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,highpass=f=80,equalizer=f=3500:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5,aresample=48000" -ac 1 "public/audio/vo/vo$i.wav"
  echo "vo$i: $line"
done < scripts/voiceover.txt
