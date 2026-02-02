#!/bin/bash

# CSS 번들링 스크립트
# 개발 시: 분리된 CSS 파일들 사용
# 프로덕션 시: 모든 CSS 파일을 하나로 번들링

# 스크립트 위치 기준으로 프로젝트 루트 찾기
cd "$(dirname "$0")/.."

echo "CSS 파일들을 번들링합니다..."

# 출력 디렉토리 생성
mkdir -p dist/css

# 모든 CSS 파일을 하나로 합치기
cat css/common.css > dist/css/style.css
cat css/pages/*.css >> dist/css/style.css

echo "번들링 완료: dist/css/style.css"
echo "파일 크기: $(wc -c < dist/css/style.css) bytes"

# 프로덕션 최소화 (dev 모드 제외)
if [ "$1" != "dev" ]; then
    echo "CSS 최소화 실행 중..."
    if ! command -v npx >/dev/null 2>&1; then
        echo "Error: npx를 찾을 수 없습니다. Node.js/npm 설치 후 다시 실행하세요."
        exit 1
    fi
    npx esbuild dist/css/style.css --minify --outfile=dist/css/style.min.css
    echo "최소화 완료: dist/css/style.min.css"
    echo "파일 크기: $(wc -c < dist/css/style.min.css) bytes"
fi

# 개발용 심볼릭 링크 생성 (선택사항)
if [ "$1" = "dev" ]; then
    echo "개발 모드: 개별 CSS 파일들을 사용합니다."
    echo "HTML 파일들은 이미 개별 CSS 파일들을 참조하도록 설정되어 있습니다."
fi