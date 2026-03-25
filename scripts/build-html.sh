#!/bin/bash

# HTML 파일 복사 스크립트
# pages/ 디렉토리의 HTML 파일들을 루트 디렉토리로 복사
# URL 구조를 유지하면서 개발 시 정리된 구조 사용

set -e  # 에러 발생 시 스크립트 중단

# 스크립트 위치 기준으로 프로젝트 루트 찾기
cd "$(dirname "$0")/.."

MODE="${1:-dev}"
# dev·prod 모두 dist — dev.sh가 dist에서만 서빙하므로 HTML은 반드시 dist로
OUTPUT_DIR="dist"
mkdir -p "$OUTPUT_DIR"

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

if [ ! -f "pages/drafts/list.html" ]; then
    echo "Error: pages/drafts/list.html not found"
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

# integration 그룹
cp pages/integration/manage.html "$OUTPUT_DIR/integration.html"

# 초안 목록
cp pages/drafts/list.html "$OUTPUT_DIR/drafts.html"

# 초안 검토 (pages 우선, 없으면 루트 레거시)
if [ -f "pages/draft-review.html" ]; then
    cp pages/draft-review.html "$OUTPUT_DIR/draft-review.html"
elif [ -f "draft-review.html" ]; then
    cp draft-review.html "$OUTPUT_DIR/draft-review.html"
fi

# 경로 수정: 개발용 상대경로를 프로덕션용 절대경로로 변경
echo "CSS 및 JS 경로 수정 중..."
# macOS와 Linux 모두 호환되도록 수정
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    (cd "$OUTPUT_DIR" && sed -i '' 's|../../css/|css/|g; s|../../js/|js/|g; s|../../assets/|assets/|g; s|href="../css/|href="css/|g; s|src="../js/|src="js/|g; s|href="../assets/|href="assets/|g; s|src="../assets/|src="assets/|g' *.html)
    # pages/* 소스에서 프로젝트 루트 HTML을 가리키는 링크 → dist 루트 파일명
    (cd "$OUTPUT_DIR" && sed -i '' \
        -e 's|href="../../posts\.html"|href="posts.html"|g' \
        -e 's|href="../../draft-review\.html"|href="draft-review.html"|g' \
        -e 's|href="../../drafts\.html"|href="drafts.html"|g' \
        -e 's|href="drafts/list\.html"|href="drafts.html"|g' \
        -e 's|href="../../login\.html"|href="login.html"|g' \
        -e 's|href="../../signup\.html"|href="signup.html"|g' \
        -e 's|href="../../make-post\.html"|href="make-post.html"|g' \
        -e 's|href="../../post-detail\.html"|href="post-detail.html"|g' \
        -e 's|href="../../edit-post\.html"|href="edit-post.html"|g' \
        -e 's|href="../../integration\.html"|href="integration.html"|g' \
        *.html)
else
    # Linux
    (cd "$OUTPUT_DIR" && sed -i 's|../../css/|css/|g; s|../../js/|js/|g; s|../../assets/|assets/|g; s|href="../css/|href="css/|g; s|src="../js/|src="js/|g; s|href="../assets/|href="assets/|g; s|src="../assets/|src="assets/|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i \
        -e 's|href="../../posts\.html"|href="posts.html"|g' \
        -e 's|href="../../draft-review\.html"|href="draft-review.html"|g' \
        -e 's|href="../../drafts\.html"|href="drafts.html"|g' \
        -e 's|href="drafts/list\.html"|href="drafts.html"|g' \
        -e 's|href="../../login\.html"|href="login.html"|g' \
        -e 's|href="../../signup\.html"|href="signup.html"|g' \
        -e 's|href="../../make-post\.html"|href="make-post.html"|g' \
        -e 's|href="../../post-detail\.html"|href="post-detail.html"|g' \
        -e 's|href="../../edit-post\.html"|href="edit-post.html"|g' \
        -e 's|href="../../integration\.html"|href="integration.html"|g' \
        *.html)
fi

echo "내부 링크 경로 수정 중..."
# 프로필 및 인증 페이지 링크 수정
if [[ "$OSTYPE" == "darwin"* ]]; then
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="\.\./profile/|href="|g; s|href="\.\./auth/|href="|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="\.\./integration/manage\.html"|href="integration.html"|g; s|href="manage\.html"|href="integration.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="\.\./posts/list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="create\.html"|href="make-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="detail\.html"|href="post-detail.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' 's|href="edit\.html"|href="edit-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i '' \
        -e 's|href="posts/list\.html"|href="posts.html"|g' \
        -e 's|href="integration/manage\.html"|href="integration.html"|g' \
        -e 's|href="profile/edit-profile\.html"|href="edit-profile.html"|g' \
        -e 's|href="profile/edit-password\.html"|href="edit-password.html"|g' \
        *.html)
else
    (cd "$OUTPUT_DIR" && sed -i 's|href="\.\./profile/|href="|g; s|href="\.\./auth/|href="|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="\.\./integration/manage\.html"|href="integration.html"|g; s|href="manage\.html"|href="integration.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="\.\./posts/list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="list\.html"|href="posts.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="create\.html"|href="make-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="detail\.html"|href="post-detail.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i 's|href="edit\.html"|href="edit-post.html"|g' *.html)
    (cd "$OUTPUT_DIR" && sed -i \
        -e 's|href="posts/list\.html"|href="posts.html"|g' \
        -e 's|href="integration/manage\.html"|href="integration.html"|g' \
        -e 's|href="profile/edit-profile\.html"|href="edit-profile.html"|g' \
        -e 's|href="profile/edit-password\.html"|href="edit-password.html"|g' \
        *.html)
fi

if [ "$MODE" = "prod" ]; then
    echo "프로덕션용 CSS 번들 경로로 변경 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        (cd "$OUTPUT_DIR" && sed -i '' '/href="css\/tailwind\.css"/d' *.html)
        (cd "$OUTPUT_DIR" && sed -i '' 's|css/common\.css|css/style.min.css|g' *.html)
        (cd "$OUTPUT_DIR" && sed -i '' '/css\/pages\//d' *.html)
    else
        (cd "$OUTPUT_DIR" && sed -i '/href="css\/tailwind\.css"/d' *.html)
        (cd "$OUTPUT_DIR" && sed -i 's|css/common\.css|css/style.min.css|g' *.html)
        (cd "$OUTPUT_DIR" && sed -i '/css\/pages\//d' *.html)
    fi
    echo "정적 자산 복사 중..."
    rm -rf "$OUTPUT_DIR"/assets
    cp -R assets "$OUTPUT_DIR"/
else
    echo "개발 모드: dist에 assets 복사 (파비콘·기본 이미지 등)"
    rm -rf "$OUTPUT_DIR/assets"
    cp -R assets "$OUTPUT_DIR"/
fi

echo "HTML 파일 복사 및 경로 수정 완료!"
echo "복사된 파일들:"
(cd "$OUTPUT_DIR" && ls -la *.html)

# 개발용 심볼릭 링크 생성 (선택사항)
if [ "$MODE" = "dev" ]; then
    echo "개발 모드: HTML이 dist/ 에 생성되었습니다. (예: python3 -m http.server 5500 --directory dist)"
fi
