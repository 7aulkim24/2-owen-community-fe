#!/bin/bash

# JS 번들링 스크립트
# 개발 시: 개별 모듈 사용
# 프로덕션 시: 페이지별 번들 생성

set -e

if [ "$1" = "dev" ]; then
    echo "개발 모드: JS 번들링을 건너뜁니다."
    exit 0
fi

echo "JS 파일들을 번들링합니다..."

# 출력 디렉토리 생성
mkdir -p dist/js/pages

# 페이지별 엔트리 번들링 (모듈 의존성 포함)
if ! command -v npx >/dev/null 2>&1; then
    echo "Error: npx를 찾을 수 없습니다. Node.js/npm 설치 후 다시 실행하세요."
    exit 1
fi
npx esbuild js/pages/*.js --bundle --minify --format=esm --outdir=dist/js/pages

echo "번들링 완료: dist/js/pages/*.js"
