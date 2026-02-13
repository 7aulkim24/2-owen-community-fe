# 프론트엔드 EC2 배포 및 QA 가이드

## 1. 사전 준비
- Node.js 18 이상
- `systemd`로 관리되는 Nginx 설치
- 보안그룹: 프론트 `80` 포트 외부 허용
- 프론트 EC2에서 백엔드 `8000` 포트 접근 가능

## 2. 필수 환경변수
```bash
export BACKEND_HOST='<백엔드_프라이빗_또는_퍼블릭_IP>'
```

선택 환경변수:
```bash
export BACKEND_PORT='8000'
export VITE_API_BASE_URL='/api'
export WEB_ROOT='/var/www/community-fe'
export NGINX_TARGET_PATH='/etc/nginx/conf.d/community.conf'
export NGINX_SERVER_NAME='_'
```

## 3. 배포 실행
```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/2-owen-community-fe
./scripts/deploy.sh
```

## 4. 서비스 점검
```bash
sudo nginx -t
sudo systemctl status nginx --no-pager -l
curl -i http://localhost/posts.html
curl -i http://localhost/api/health
```

## 5. 스모크 QA
```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/2-owen-community-fe
./scripts/qa-smoke.sh http://localhost
```

검증 항목:
- 정적 페이지 서빙(`/posts.html`)
- API 프록시(`/api/health`, `/api/v1/posts`)

## 6. 트러블슈팅
- `/api/*`가 `502`: 백엔드 호스트/포트, 백엔드 서비스 상태 확인.
- Nginx 문법 오류: `sudo nginx -t` 실행 후 `community.conf` 확인.
- 정적 파일 갱신 문제: 배포 스크립트를 다시 실행해 웹 루트 재배포.
