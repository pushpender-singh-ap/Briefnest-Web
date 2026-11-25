#!/bin/bash
# Builds the web video derivatives from the approved Briefnest film.
#
# The masters in marketing/briefnest-product-video/dist are read, never written.
# Output goes to website/public/videos. Re-run only when the film changes; the
# results are kept in the repository so a deploy doesn't need FFmpeg.
#
#   bash scripts/prepare-media.sh            # everything
#   bash scripts/prepare-media.sh captions   # only the WebVTT captions
#
# Needs ffmpeg with libx264, libsvtav1 and aac.
set -euo pipefail

site=$(cd "$(dirname "$0")/.." && pwd)
dist="${BRIEFNEST_FILM_DIST:-$site/../marketing/briefnest-product-video/dist}"
out="$site/public/videos"
film="$dist/briefnest-launch-4k.mp4"
captions="$dist/briefnest-subtitles.srt"
what="${1:-all}"

for f in "$film" "$captions"; do
  [ -f "$f" ] || { echo "Missing master: $f" >&2; exit 1; }
done
mkdir -p "$out"

ff() { SVT_LOG=1 ffmpeg -hide_banner -loglevel error -nostdin -y "$@"; }
scale() { echo "scale=$1:$2:flags=lanczos,format=yuv420p"; }

# SRT → WebVTT. Cue text and timing are unchanged.
captions() {
  ff -i "$captions" -f webvtt "$out/briefnest-film.en.vtt"
}

# H.264 + AAC: plays everywhere. Two-second keyframes keep seeking quick.
h264() { # input width height level crf maxrate audio-bitrate output
  ff -i "$1" -map 0:v:0 -map 0:a:0 -vf "$(scale "$2" "$3")" \
    -c:v libx264 -preset slow -profile:v high -level:v "$4" -crf "$5" -maxrate "$6" -bufsize "$(( ${6%k} * 2 ))k" \
    -g 60 -keyint_min 60 -sc_threshold 0 \
    -c:a aac -b:a "$7" -ac 2 -ar 48000 -movflags +faststart "$8"
}

# AV1 + AAC in MP4: roughly half the bytes where the browser can decode it.
av1() { # input width height crf audio-bitrate output
  ff -i "$1" -map 0:v:0 -map 0:a:0 -vf "$(scale "$2" "$3")" \
    -c:v libsvtav1 -preset 5 -crf "$4" -g 60 -svtav1-params tune=0 \
    -c:a aac -b:a "$5" -ac 2 -ar 48000 -movflags +faststart "$6"
}

# Silent loops for the hero preview: no audio track, so autoplay is always allowed.
silent_h264() { # input width height level crf maxrate output
  ff -i "$1" -map 0:v:0 -an -vf "$(scale "$2" "$3")" \
    -c:v libx264 -preset slow -profile:v high -level:v "$4" -crf "$5" -maxrate "$6" -bufsize "$(( ${6%k} * 2 ))k" \
    -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$7"
}
silent_av1() { # input width height crf output
  ff -i "$1" -map 0:v:0 -an -vf "$(scale "$2" "$3")" \
    -c:v libsvtav1 -preset 5 -crf "$4" -g 60 -svtav1-params tune=0 -movflags +faststart "$5"
}

videos() {
  h264 "$film" 1920 1080 4.1 21 6000k 160k "$out/briefnest-film-1080p.mp4"
  h264 "$film" 1280 720 3.1 23 2600k 128k "$out/briefnest-film-720p.mp4"
  av1  "$film" 1920 1080 30 128k "$out/briefnest-film-1080p.av1.mp4"
  silent_h264 "$film" 1280 720 3.1 28 1200k "$out/briefnest-preview-720p.mp4"
  silent_av1  "$film" 1280 720 40 "$out/briefnest-preview-720p.av1.mp4"
}

case "$what" in
  captions) captions ;;
  videos) videos ;;
  all) captions; videos ;;
  *) echo "Usage: $0 [all|captions|videos]" >&2; exit 1 ;;
esac

# On Cloudflare the film handler needs each video's length; keep its list in step with the new files.
node "$site/scripts/video-sizes.mjs" public

echo "Web video derivatives in $out:"
for f in "$out"/*.mp4 "$out"/*.vtt; do
  printf '  %-40s %s\n' "$(basename "$f")" "$(du -h "$f" | cut -f1)"
done
