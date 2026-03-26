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
API_BASE_URL="${VITE_API_BASE_URL:-/api}"

echo "Building JavaScript with API_BASE_URL=$API_BASE_URL..."

# 모든 페이지 엔트리를 가져와서 --splitting을 통해 공통 청크 자동 분리
npx esbuild js/pages/*.js \
  --bundle \
  --minify \
  --splitting \
  --format=esm \
  --outdir=dist/js/pages \
  --chunk-names=../chunks/[name]-[hash] \
  --define:__API_BASE_URL__="'$API_BASE_URL'"

echo "✓ JavaScript build complete!"
echo "  API Base URL: $API_BASE_URL"
