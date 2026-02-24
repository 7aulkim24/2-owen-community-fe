#!/bin/bash

# 프론트엔드 Docker 기반 EC2 배포 스크립트
# 사용법:
#   ./scripts/deploy.sh <my-id>/community-fe:latest

set -euo pipefail

echo "===== 프론트엔드 Docker 배포 시작 ====="

DOCKER_IMAGE="${1:-my-id/community-fe:latest}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: '$1' 명령어가 필요합니다."
    exit 1
  fi
}

require_command docker

echo "Docker 이미지 Pull: $DOCKER_IMAGE"
docker pull "$DOCKER_IMAGE"

if docker ps -a | grep -q "frontend"; then
  echo "기존 frontend 컨테이너 중지 및 삭제..."
  docker stop frontend || true
  docker rm frontend || true
fi

echo "Frontend 컨테이너 실행..."
docker run -d --name frontend -p 80:80 \
  --restart unless-stopped \
  --log-driver=awslogs \
  --log-opt awslogs-region=ap-northeast-2 \
  --log-opt awslogs-group=community-logs \
  --log-opt awslogs-stream=frontend \
  --log-opt awslogs-create-group=true \
  "$DOCKER_IMAGE"

echo "===== 프론트엔드 배포 완료 ====="
docker ps | grep frontend
