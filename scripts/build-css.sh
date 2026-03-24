#!/bin/bash

# CSS 번들링 스크립트
# - Tailwind: 로컬 빌드 (CDN 사용 안 함 — 프로덕션 경고 제거)
# - 개발: dist/css/tailwind.css + common + pages 복사, style.css = common+pages(레거시)
# - 프로덕션: tailwind(압축)+common+pages → style.css → esbuild → style.min.css

set -e

cd "$(dirname "$0")/.."

echo "CSS 빌드 시작..."

mkdir -p dist/css/pages

if ! command -v npx >/dev/null 2>&1; then
    echo "Error: npx를 찾을 수 없습니다. Node.js/npm 설치 후 다시 실행하세요."
    exit 1
fi

if [ "$1" = "dev" ]; then
    npx tailwindcss -i ./css/tailwind.entry.css -o ./dist/css/tailwind.css
    echo "Tailwind 완료: dist/css/tailwind.css ($(wc -c < dist/css/tailwind.css) bytes)"
else
    TW_TMP="$(mktemp)"
    npx tailwindcss -i ./css/tailwind.entry.css -o "$TW_TMP" --minify
    cat "$TW_TMP" css/common.css > dist/css/style.css
    for f in css/pages/*.css; do
        [ -f "$f" ] && cat "$f" >> dist/css/style.css
    done
    rm -f "$TW_TMP"
    echo "통합 번들: dist/css/style.css ($(wc -c < dist/css/style.css) bytes)"
    npx esbuild dist/css/style.css --minify --outfile=dist/css/style.min.css
    echo "최소화 완료: dist/css/style.min.css ($(wc -c < dist/css/style.min.css) bytes)"
fi

cp css/common.css dist/css/common.css
cp css/pages/*.css dist/css/pages/

if [ "$1" = "dev" ]; then
    cat css/common.css > dist/css/style.css
    for f in css/pages/*.css; do
        [ -f "$f" ] && cat "$f" >> dist/css/style.css
    done
fi

echo "CSS 빌드 완료."
