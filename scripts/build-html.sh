#!/bin/bash

# HTML 파일 복사 스크립트
# pages/ 디렉토리의 HTML 파일들을 루트 디렉토리로 복사
# URL 구조를 유지하면서 개발 시 정리된 구조 사용

set -e  # 에러 발생 시 스크립트 중단

# 스크립트 위치 기준으로 프로젝트 루트 찾기
cd "$(dirname "$0")/.."

MODE="${1:-dev}"

if [ "$MODE" = "prod" ]; then
    OUTPUT_DIR="dist"
else
    OUTPUT_DIR="."
fi

if [ "$OUTPUT_DIR" != "." ]; then
    mkdir -p "$OUTPUT_DIR"
fi

echo "HTML 파일들을 $OUTPUT_DIR 디렉토리로 복사합니다..."

# 소스 파일 존재 확인
if [ ! -f "pages/auth/login.html" ] || [ ! -f "pages/auth/signup.html" ]; then
    echo "Error: Auth HTML files not found in pages/auth/"
    exit 1
fi

if [ ! -f "pages/posts/list.html" ] || [ ! -f "pages/posts/detail.html" ] || [ ! -f "pages/posts/create.html" ] || [ ! -f "pages/posts/edit.html" ]; then
    echo "Error: Posts HTML files not found in pages/posts/"
    exit 1
fi

if [ ! -f "pages/profile/edit-profile.html" ] || [ ! -f "pages/profile/edit-password.html" ]; then
    echo "Error: Profile HTML files not found in pages/profile/"
    exit 1
fi

# pages/ 디렉토리의 HTML 파일들을 URL 구조에 맞게 복사
# auth 그룹
cp pages/auth/login.html "$OUTPUT_DIR/login.html"
cp pages/auth/signup.html "$OUTPUT_DIR/signup.html"

# posts 그룹 (기존 URL 구조 유지)
cp pages/posts/list.html "$OUTPUT_DIR/posts.html"
cp pages/posts/detail.html "$OUTPUT_DIR/post-detail.html"
cp pages/posts/create.html "$OUTPUT_DIR/make-post.html"
cp pages/posts/edit.html "$OUTPUT_DIR/edit-post.html"

# profile 그룹
cp pages/profile/edit-profile.html "$OUTPUT_DIR/edit-profile.html"
cp pages/profile/edit-password.html "$OUTPUT_DIR/edit-password.html"

# 경로 수정: 개발용 상대경로를 프로덕션용 절대경로로 변경
echo "CSS 및 JS 경로 수정 중..."
# macOS와 Linux 모두 호환되도록 수정
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    (cd "$OUTPUT_DIR" && sed -i '' 's|../../css/|css/|g; s|../../js/|js/|g' *.html)
else
    # Linux
    (cd "$OUTPUT_DIR" && sed -i 's|../../css/|css/|g; s|../../js/|js/|g' *.html)
fi

echo "내부 링크 경로 수정 중..."
# 프로필 및 인증 페이지 링크 수정
if [[ "$OSTYPE" == "darwin"* ]]; then
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="\.\./profile/|href="|g; s|href="\.\./auth/|href="|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="\.\./posts/list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="create\.html"|href="make-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="detail\.html"|href="post-detail.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="edit\.html"|href="edit-post.html"|g' *.html)
else
    (cd "$OUTPUT_DIR" && sed -i 's|href="\.\./profile/|href="|g; s|href="\.\./auth/|href="|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="\.\./posts/list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="create\.html"|href="make-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="detail\.html"|href="post-detail.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="edit\.html"|href="edit-post.html"|g' *.html)
fi

if [ "$MODE" = "prod" ]; then
    echo "프로덕션용 CSS 번들 경로로 변경 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        (cd "$OUTPUT_DIR" && sed -i '' 's|css/common\.css|css/style.min.css|g' *.html)
        (cd "$OUTPUT_DIR" && sed -i '' '/css\/pages\//d' *.html)
    else
        (cd "$OUTPUT_DIR" && sed -i 's|css/common\.css|css/style.min.css|g' *.html)
        (cd "$OUTPUT_DIR" && sed -i '/css\/pages\//d' *.html)
    fi
    echo "정적 자산 복사 중..."
    rm -rf "$OUTPUT_DIR"/assets
    cp -R assets "$OUTPUT_DIR"/
else
    echo "개발 모드: 정적 자산이 이미 루트 디렉토리에 존재하므로 추가 작업을 생략합니다."
fi

echo "HTML 파일 복사 및 경로 수정 완료!"
echo "복사된 파일들:"
(cd "$OUTPUT_DIR" && ls -la *.html)

# 개발용 심볼릭 링크 생성 (선택사항)
if [ "$MODE" = "dev" ]; then
    echo "개발 모드: HTML 파일들이 루트 디렉토리(.)에 생성되었습니다."
    echo "Live Server 등을 사용하여 루트 디렉토리에서 바로 서빙할 수 있습니다."
fi
