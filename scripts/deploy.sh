#!/bin/bash

# 프론트엔드 EC2 배포 스크립트
# 사용법: ./scripts/deploy.sh [BACKEND_EC2_NAME]

set -e

echo "===== 프론트엔드 EC2 배포 시작 ====="

# 설정
BACKEND_EC2_NAME="${1:-community-backend}"
PROJECT_DIR="/home/ec2-user/assignment/2-owen-community-fe"

# AWS CLI로 백엔드 EC2 IP 가져오기
echo "백엔드 EC2 IP를 가져오는 중..."
BACKEND_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=$BACKEND_EC2_NAME" \
            "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

if [ "$BACKEND_IP" = "None" ] || [ -z "$BACKEND_IP" ]; then
  echo "ERROR: 백엔드 EC2 IP를 찾을 수 없습니다."
  echo "EC2 인스턴스에 Name 태그 '$BACKEND_EC2_NAME'가 설정되어 있는지 확인하세요."
  exit 1
fi

echo "백엔드 IP: $BACKEND_IP"
BACKEND_URL="http://$BACKEND_IP:8000"

# .env.production 생성
echo ".env.production 파일 생성 중..."
cd "$PROJECT_DIR"
sed -e "s|{{BACKEND_URL}}|$BACKEND_URL|g" \
    .env.production.template > .env.production

echo ".env.production 파일이 생성되었습니다."

# Node.js 의존성 설치
echo "Node.js 패키지 설치 중..."
npm install -q

# 프로덕션 빌드
echo "프로덕션 빌드 실행 중..."
npm run build:prod

# Nginx 설정 (정적 파일 서빙)
if command -v nginx &> /dev/null; then
  echo "Nginx로 정적 파일 배포 중..."
  sudo cp -r dist/* /usr/share/nginx/html/
  sudo systemctl restart nginx
  echo "✓ Nginx 재시작 완료"
else
  # Nginx 없으면 Python http.server 사용
  echo "Python http.server로 서빙 중..."
  cd dist
  pkill -f "python3 -m http.server" || true
  nohup python3 -m http.server 80 > frontend.log 2>&1 &
  echo "✓ HTTP 서버 시작 완료 (포트 80)"
fi

echo ""
echo "===== 프론트엔드 배포 완료 ====="
echo "접속 URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
