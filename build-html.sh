#!/bin/bash

# HTML 파일 복사 스크립트
# pages/ 디렉토리의 HTML 파일들을 루트 디렉토리로 복사
# URL 구조를 유지하면서 개발 시 정리된 구조 사용

set -e  # 에러 발생 시 스크립트 중단

echo "HTML 파일들을 루트 디렉토리로 복사합니다..."

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
cp pages/auth/login.html login.html
cp pages/auth/signup.html signup.html

# posts 그룹 (기존 URL 구조 유지)
cp pages/posts/list.html posts.html
cp pages/posts/detail.html post-detail.html
cp pages/posts/create.html make-post.html
cp pages/posts/edit.html edit-post.html

# profile 그룹
cp pages/profile/edit-profile.html edit-profile.html
cp pages/profile/edit-password.html edit-password.html

# 경로 수정: 개발용 상대경로를 프로덕션용 절대경로로 변경
echo "CSS 및 JS 경로 수정 중..."
sed -i '' 's|../../css/|css/|g; s|../../js/|js/|g' *.html

echo "내부 링크 경로 수정 중..."
# 프로필 및 인증 페이지 링크 수정
sed -i '' 's|href="\.\./profile/|href="|g; s|href="\.\./auth/|href="|g' *.html
# 게시글 페이지 링크 수정
sed -i '' 's|href="\.\./posts/list\.html"|href="posts.html"|g' *.html
sed -i '' 's|href="list\.html"|href="posts.html"|g' *.html
sed -i '' 's|href="create\.html"|href="make-post.html"|g' *.html
sed -i '' 's|href="detail\.html"|href="post-detail.html"|g' *.html
sed -i '' 's|href="edit\.html"|href="edit-post.html"|g' *.html

echo "HTML 파일 복사 및 경로 수정 완료!"
echo "복사된 파일들:"
ls -la *.html

# 개발용 심볼릭 링크 생성 (선택사항)
if [ "$1" = "dev" ]; then
    echo "개발 모드: pages/ 디렉토리의 파일들을 사용합니다."
    echo "빌드된 파일들은 프로덕션 배포용입니다."
fi