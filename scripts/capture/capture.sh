#!/bin/bash
# Renders the website's product screenshots from the real SwiftUI views.
#
# Same approach as marketing/briefnest-product-video/scripts/capture.sh: copy the package to a temporary folder,
# swap only that copy's entry point for Capture.swift, seed temporary stores with the synthetic Inknest fixture,
# render the app's own views offscreen and exit. The checkout, the installed app and its data are not touched.
#
# Needs the product's Swift toolchain and the FluidAudio checkout that `swift build` resolved into .build/checkouts.
# Output: website/assets/captures/*.png. Run `npm run images` afterwards.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
site=$(cd "$here/../.." && pwd)
repo=$(cd "$site/.." && pwd)
out="$site/assets/captures"
media="$repo/marketing/briefnest-product-video/assets/media"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$out"
cp -R "$repo/Sources" "$repo/Tests" "$repo/Package.swift" "$work/"
python3 - "$work" "$repo" <<'PY'
from pathlib import Path
import re, sys
work, repo = map(Path, sys.argv[1:])
p = work / 'Package.swift'
p.write_text(re.sub(r'.package\(url: "https://github.com/FluidInference/FluidAudio.git",\s*revision: "[a-f0-9]+", traits: \[\]\)', f'.package(path: "{repo}/.build/checkouts/FluidAudio", traits: [])', p.read_text()))
p = work / 'Sources/BriefnestApp/BriefnestApp.swift'
p.write_text(p.read_text().replace('@main enum BriefnestMain', 'enum BriefnestMain'))
# The meeting page's tab is private view state; let a render choose which tab it opens on.
p = work / 'Sources/BriefnestApp/MeetingDetail.swift'
source = p.read_text()
assert '@State private var tab = 0' in source, 'MeetingDetail tab state moved'
p.write_text(source.replace('@State private var tab = 0', '@State private var tab = CaptureTab.value', 1))
PY
cp "$here/Capture.swift" "$work/Sources/BriefnestApp/"
swift build --package-path "$work" --disable-sandbox --product Briefnest -c debug > "$work/compile.log" 2>&1 || { grep -E "error|warning: unre" "$work/compile.log" | head -60; tail -30 "$work/compile.log"; exit 1; }
BRIEFNEST_CAPTURE_OUT="$out" BRIEFNEST_CAPTURE_MEDIA="$media" "$work/.build/debug/Briefnest"
echo "Captures written to $out"
