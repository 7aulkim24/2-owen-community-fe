#!/bin/bash

# 프론트엔드 EC2 배포 스크립트
# 사용법:
#   BACKEND_HOST=10.0.1.23 ./scripts/deploy.sh
#   ./scripts/deploy.sh community-backend

set -euo pipefail

echo "===== 프론트엔드 EC2 배포 시작 ====="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_EC2_NAME="${1:-${BACKEND_EC2_NAME:-community-backend}}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
BACKEND_HOST="${BACKEND_HOST:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"
WEB_ROOT="${WEB_ROOT:-/var/www/community-fe}"
NGINX_TEMPLATE_PATH="$PROJECT_DIR/deploy/nginx.community.conf"
NGINX_TARGET_PATH="${NGINX_TARGET_PATH:-/etc/nginx/conf.d/community.conf}"
NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-_}"
AWS_IP_FIELD="${AWS_IP_FIELD:-PrivateIpAddress}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: '$1' 명령어가 필요합니다."
    exit 1
  fi
}

require_command npm
require_command sed
require_command systemctl
require_command nginx

if [ -z "$BACKEND_HOST" ]; then
  if command -v aws >/dev/null 2>&1; then
    echo "BACKEND_HOST 미설정: AWS CLI로 인스턴스 '$BACKEND_EC2_NAME' 조회 중..."
    BACKEND_HOST=$(aws ec2 describe-instances \
      --filters "Name=tag:Name,Values=$BACKEND_EC2_NAME" "Name=instance-state-name,Values=running" \
      --query "Reservations[0].Instances[0].$AWS_IP_FIELD" \
      --output text 2>/dev/null || true)
  fi
fi

if [ -z "$BACKEND_HOST" ] || [ "$BACKEND_HOST" = "None" ]; then
  echo "ERROR: BACKEND_HOST를 확인할 수 없습니다."
  echo "예시: BACKEND_HOST=10.0.1.23 ./scripts/deploy.sh"
  exit 1
fi

echo "백엔드 대상: $BACKEND_HOST:$BACKEND_PORT"
echo "프로젝트 디렉토리: $PROJECT_DIR"

cd "$PROJECT_DIR"

echo ".env.production 생성 중..."
cat > .env.production <<EOF
VITE_API_BASE_URL=$API_BASE_URL
EOF
echo "✓ .env.production 생성 완료"

if [ -f package-lock.json ]; then
  echo "Node 의존성 설치(npm ci)..."
  npm ci --silent
else
  echo "Node 의존성 설치(npm install)..."
  npm install --silent
fi

echo "프로덕션 빌드 실행..."
npm run build:prod

if [ ! -d dist ]; then
  echo "ERROR: dist 디렉토리가 생성되지 않았습니다."
  exit 1
fi

echo "Nginx 정적 파일 반영: $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo find "$WEB_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo cp -R dist/. "$WEB_ROOT/"

if [ ! -f "$NGINX_TEMPLATE_PATH" ]; then
  echo "ERROR: Nginx 템플릿이 없습니다: $NGINX_TEMPLATE_PATH"
  exit 1
fi

echo "Nginx 설정 파일 배포: $NGINX_TARGET_PATH"
tmp_nginx_conf="$(mktemp)"
sed \
  -e "s|__WEB_ROOT__|$WEB_ROOT|g" \
  -e "s|__BACKEND_HOST__|$BACKEND_HOST|g" \
  -e "s|__BACKEND_PORT__|$BACKEND_PORT|g" \
  -e "s|__SERVER_NAME__|$NGINX_SERVER_NAME|g" \
  "$NGINX_TEMPLATE_PATH" > "$tmp_nginx_conf"
sudo cp "$tmp_nginx_conf" "$NGINX_TARGET_PATH"
rm -f "$tmp_nginx_conf"

echo "Nginx 설정 검증..."
sudo nginx -t

echo "Nginx 재시작..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager -l | head -n 20

echo ""
echo "===== 프론트엔드 배포 완료 ====="
echo "정적 루트: $WEB_ROOT"
echo "API 프록시: /api -> http://$BACKEND_HOST:$BACKEND_PORT"
