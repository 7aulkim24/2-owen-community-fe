# Docker 통합 배포 가이드 (Primary)

이 디렉토리는 과제 기본 배포 경로인 `단일 Linux + 3컨테이너(frontend/backend/db)` 구성을 제공합니다.

## 1. 사전 준비

1. Docker Engine + Docker Compose plugin 설치
2. Docker Hub 로그인

```bash
docker login
```

## 2. 환경 변수 준비

```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/docker
cp .env.example .env
```

`.env`에서 최소 아래 값은 반드시 수정:

- `DOCKERHUB_NAMESPACE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `SECRET_KEY`

## 3. 로컬 통합 실행/검증

```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/docker
docker compose --env-file .env -f docker-compose.local.yml up --build -d
```

검증:

```bash
curl -i http://localhost/health
curl -i http://localhost/api/health

/Users/eskim00/Documents/Programming/KDT_AWS/Assignment/2-owen-community-be/scripts/qa-smoke.sh http://localhost/api
/Users/eskim00/Documents/Programming/KDT_AWS/Assignment/2-owen-community-fe/scripts/qa-smoke.sh http://localhost
```

종료:

```bash
docker compose -f docker-compose.local.yml down
```

## 4. 이미지 빌드/푸시

```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment
DOCKERHUB_NAMESPACE=<your-id> IMAGE_TAG=latest ./docker/scripts/build-and-push.sh
```

옵션:

- `PUSH_LATEST=true`: 버전 태그 빌드 시 `latest` 동시 push
- `EXTRA_TAG=v1.0.0`: 추가 태그 동시 push
- `TARGET_PLATFORM=linux/amd64`: 이미지 대상 플랫폼 지정 (`linux/arm64` 가능)

## 5. Linux 서버 배포

서버에 `docker-compose.yml`와 `.env` 준비 후:

```bash
scp -i /Users/eskim00/Desktop/linux-key.pem /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/docker/docker-compose.yml ubuntu@<ec2-host>:/home/ubuntu/community/docker/
scp -i /Users/eskim00/Desktop/linux-key.pem /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/docker/scripts/*.sh ubuntu@<ec2-host>:/home/ubuntu/community/docker/scripts/
scp -i /Users/eskim00/Desktop/linux-key.pem /Users/eskim00/Documents/Programming/KDT_AWS/Assignment/docker/.env.example ubuntu@<ec2-host>:/home/ubuntu/community/docker/
```

```bash
cd /home/ubuntu/community/docker/
docker compose --env-file .env -f docker-compose.yml down --remove-orphans || true
docker compose --env-file .env -f docker-compose.yml pull
docker compose --env-file .env -f docker-compose.yml up -d db backend frontend
```

### 5.0 배포 후 FE/BE/DB 서버 실행 순서

한 번에 모두 실행하려면:

```bash
cd /home/ubuntu/community/docker
docker compose --env-file .env -f docker-compose.yml up -d db backend frontend
```

검증:

```bash
docker ps
curl -i http://localhost/api/health
```

### 5.1 배포 후 서버 실행(운영 고정) 절차

```bash
cd /home/ubuntu/community/docker
chmod +x scripts/refresh-public-ip-and-redeploy.sh scripts/install-refresh-service.sh
DEPLOY_DIR="$(pwd)"
sudo ./scripts/install-refresh-service.sh "$DEPLOY_DIR"
sudo systemctl start community-compose-refresh.service
sudo systemctl status community-compose-refresh.service --no-pager
journalctl -u community-compose-refresh.service -n 100 --no-pager
```

부팅 후 자동 재적용 확인(선택):

```bash
sudo reboot
# 재접속 후
sudo systemctl status community-compose-refresh.service --no-pager
docker compose --env-file .env -f docker-compose.yml ps
```

충돌 컨테이너가 이미 있을 때:

```bash
cd /home/ubuntu/community/docker
docker rm -f community-db community-be community-fe 2>/dev/null || true
docker compose --env-file .env -f docker-compose.yml down --remove-orphans || true
docker compose --env-file .env -f docker-compose.yml up -d
```

## 6. EC2 Public IP 자동 반영 (Elastic IP 미사용 시)

EC2를 `stop/start` 하면 Public IP가 바뀌므로 `ALLOWED_ORIGINS`를 자동 갱신하고 compose를 재적용합니다.

### 6.1 1회 수동 실행

```bash
cd /home/ubuntu/community/docker
chmod +x scripts/refresh-public-ip-and-redeploy.sh
./scripts/refresh-public-ip-and-redeploy.sh
```

옵션 예시:

```bash
# 컨테이너 up 전에 이미지 pull까지 수행
AUTO_PULL_IMAGES=true ./scripts/refresh-public-ip-and-redeploy.sh
```

### 6.2 부팅 시 자동 실행(systemd)

```bash
cd /home/ubuntu/community/docker
chmod +x scripts/refresh-public-ip-and-redeploy.sh scripts/install-refresh-service.sh
DEPLOY_DIR="$(pwd)"
sudo ./scripts/install-refresh-service.sh "$DEPLOY_DIR"
sudo systemctl start community-compose-refresh.service
```

상태 확인:

```bash
sudo systemctl status community-compose-refresh.service --no-pager
journalctl -u community-compose-refresh.service -n 100 --no-pager
```

`ExecStart` 경로를 직접 관리하려면 템플릿 파일 `systemd/community-compose-refresh.service`를 `/etc/systemd/system/`에 복사 후 경로를 수정해도 됩니다.

## 7. 수동 도커 배포 실행 방법

GitHub Actions 없이 수동으로 반영하려면 아래 순서를 사용합니다.

### 7.1 로컬(macOS)에서 이미지 빌드/푸시

```bash
cd /Users/eskim00/Documents/Programming/KDT_AWS/Assignment
DOCKERHUB_NAMESPACE=eskim00 IMAGE_TAG=<tag> ./docker/scripts/build-and-push.sh
```

### 7.2 EC2에서 재배포 (권장: 스크립트)

```bash
cd /home/ubuntu/community/docker/
IMAGE_TAG=<tag> DOCKERHUB_NAMESPACE=eskim00 ./scripts/deploy-on-ec2.sh
```

이 방식은 `.env`의 `IMAGE_TAG`를 갱신하고 `pull + up` 후 헬스체크까지 수행합니다.

### 7.3 EC2에서 재배포 (직접 compose 실행)

```bash
cd /home/ubuntu/community/docker/
sed -i.bak "s/^IMAGE_TAG=.*/IMAGE_TAG=<tag>/" .env
docker compose --env-file .env -f docker-compose.yml pull
docker compose --env-file .env -f docker-compose.yml up -d
curl -i http://localhost/api/health
```

## 8. GitHub Actions 자동 배포 템플릿

레포에 추가된 워크플로:

- `.github/workflows/deploy-ec2.yml`

동작:

1. `main` push(또는 수동 실행) 시 FE/BE/DB 이미지를 Docker Hub에 push
2. EC2로 `docker/` 디렉토리 업로드
3. EC2에서 `scripts/deploy-on-ec2.sh` 실행 (태그 반영 + compose 재배포 + 헬스체크)

### GitHub Secrets

필수:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_NAMESPACE`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_DEPLOY_DIR` (예: `/home/ubuntu/community/docker`)

선택:

- `EC2_ENV_FILE_B64`
  - `.env` 파일 전체를 base64 인코딩한 값
  - 설정 시 배포마다 EC2의 `.env`를 자동 갱신

인코딩 예시(macOS):

```bash
base64 -i .env | pbcopy
```

### EC2 최초 1회 준비

```bash
mkdir -p /home/ubuntu/community/docker
cd /home/ubuntu/community/docker
# .env는 직접 생성하거나, GitHub Secret EC2_ENV_FILE_B64로 주입
```

`.env`에는 최소 아래 값이 필요:

- `DOCKERHUB_NAMESPACE`
- `IMAGE_TAG` (초기값은 `latest` 등 임의값 가능)
- DB/Backend 관련 시크릿 값

워크플로 배포 시점에는 `IMAGE_TAG`가 자동으로 갱신됩니다.