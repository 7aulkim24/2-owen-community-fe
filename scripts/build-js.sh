#!/bin/bash

# JavaScript 빌드 스크립트
# esbuild를 사용하여 환경변수를 주입하면서 번들링

set -e

cd "$(dirname "$0")/.."

# 환경 변수 로드 (.env.production 우선, 없으면 .env)
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
    echo "✓ Loaded .env.production"
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✓ Loaded .env"
fi

# 환경변수 기본값 설정
API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:8000}"

echo "Building JavaScript with API_BASE_URL=$API_BASE_URL..."

# 출력 디렉토리 생성
mkdir -p dist/js/pages
mkdir -p dist/js/utils

# api.js 번들링 (공통 모듈)
npx esbuild js/api.js \
  --bundle \
  --minify \
  --format=esm \
  --outfile=dist/js/api.js \
  --define:__API_BASE_URL__="'$API_BASE_URL'"

# error-messages.js 복사 (독립 모듈)
npx esbuild js/error-messages.js \
  --bundle \
  --minify \
  --format=esm \
  --outfile=dist/js/error-messages.js

# utils 디렉토리 번들링
for entry in js/utils/*.js; do
  if [ -f "$entry" ]; then
    filename=$(basename "$entry")
    npx esbuild "$entry" \
      --bundle \
      --minify \
      --format=esm \
      --outfile="dist/js/utils/$filename"
  fi
done

# 각 페이지별 엔트리 포인트 빌드
for entry in js/pages/*.js; do
  if [ -f "$entry" ]; then
    filename=$(basename "$entry")
    npx esbuild "$entry" \
      --bundle \
      --minify \
      --format=esm \
      --outfile="dist/js/pages/$filename" \
      --define:__API_BASE_URL__="'$API_BASE_URL'"
  fi
done

echo "✓ JavaScript build complete!"
echo "  API Base URL: $API_BASE_URL"
