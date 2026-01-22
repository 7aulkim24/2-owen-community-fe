#!/bin/bash

# CSS 번들링 스크립트
# 개발 시: 분리된 CSS 파일들 사용
# 프로덕션 시: 모든 CSS 파일을 하나로 번들링

echo "CSS 파일들을 번들링합니다..."

# 출력 디렉토리 생성
mkdir -p dist/css

# 모든 CSS 파일을 하나로 합치기
cat css/common.css > dist/css/style.css
cat css/pages/*.css >> dist/css/style.css

echo "번들링 완료: dist/css/style.css"
echo "파일 크기: $(wc -c < dist/css/style.css) bytes"

# 개발용 심볼릭 링크 생성 (선택사항)
if [ "$1" = "dev" ]; then
    echo "개발 모드: 개별 CSS 파일들을 사용합니다."
    echo "HTML 파일들은 이미 개별 CSS 파일들을 참조하도록 설정되어 있습니다."
fi