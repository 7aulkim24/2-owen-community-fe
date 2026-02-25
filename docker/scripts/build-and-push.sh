#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

DOCKERHUB_NAMESPACE="${DOCKERHUB_NAMESPACE:-${1:-}}"
IMAGE_TAG="${IMAGE_TAG:-${2:-latest}}"
PUSH_LATEST="${PUSH_LATEST:-false}"
EXTRA_TAG="${EXTRA_TAG:-}"
TARGET_PLATFORM="${TARGET_PLATFORM:-linux/amd64}"

if [ -z "$DOCKERHUB_NAMESPACE" ]; then
  echo "ERROR: DOCKERHUB_NAMESPACE가 필요합니다."
  echo "Usage: DOCKERHUB_NAMESPACE=<id> $0 [namespace] [tag]"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker 명령어를 찾을 수 없습니다."
  exit 1
fi

build_and_push() {
  local service_name="$1"
  local dockerfile="$2"
  local image_ref="${DOCKERHUB_NAMESPACE}/${service_name}:${IMAGE_TAG}"

  echo "==> Build: $image_ref"
  docker build \
    --platform "$TARGET_PLATFORM" \
    -f "$PROJECT_ROOT/$dockerfile" \
    -t "$image_ref" \
    "$PROJECT_ROOT"

  echo "==> Push: $image_ref"
  docker push "$image_ref"

  if [ -n "$EXTRA_TAG" ]; then
    local extra_ref="${DOCKERHUB_NAMESPACE}/${service_name}:${EXTRA_TAG}"
    echo "==> Extra tag push: $extra_ref"
    docker tag "$image_ref" "$extra_ref"
    docker push "$extra_ref"
  fi

  if [ "$PUSH_LATEST" = "true" ] && [ "$IMAGE_TAG" != "latest" ]; then
    local latest_ref="${DOCKERHUB_NAMESPACE}/${service_name}:latest"
    echo "==> Latest tag push: $latest_ref"
    docker tag "$image_ref" "$latest_ref"
    docker push "$latest_ref"
  fi
}

build_and_push "community-fe" "docker/Dockerfile.fe"
build_and_push "community-be" "docker/Dockerfile.be"
build_and_push "community-db" "docker/Dockerfile.db"

echo "완료: FE/BE/DB 이미지 빌드 및 Push"
