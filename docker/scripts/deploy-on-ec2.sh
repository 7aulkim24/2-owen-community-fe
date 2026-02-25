#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
ENV_FILE="${ENV_FILE:-$DEPLOY_DIR/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_DIR/docker-compose.yml}"

IMAGE_TAG="${1:-${IMAGE_TAG:-}}"
DOCKERHUB_NAMESPACE="${DOCKERHUB_NAMESPACE:-}"

log() {
  echo "[deploy-ec2] $*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

upsert_env() {
  local key="$1"
  local value="$2"
  local tmp_file

  tmp_file="$(mktemp)"

  awk -v k="$key" -v v="$value" '
    BEGIN { updated = 0 }
    $0 ~ "^" k "=" {
      print k "=" v
      updated = 1
      next
    }
    { print }
    END {
      if (!updated) {
        print k "=" v
      }
    }
  ' "$ENV_FILE" > "$tmp_file"

  mv "$tmp_file" "$ENV_FILE"
}

main() {
  require_command docker
  require_command awk
  require_command curl

  if [ -z "$IMAGE_TAG" ]; then
    echo "ERROR: IMAGE_TAG가 필요합니다. (인자 또는 환경변수)" >&2
    echo "Usage: IMAGE_TAG=<tag> $0 [image_tag]" >&2
    exit 1
  fi

  if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: env file not found: $ENV_FILE" >&2
    exit 1
  fi

  if [ ! -f "$COMPOSE_FILE" ] && [ -f "$DEPLOY_DIR/docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="$DEPLOY_DIR/docker-compose.deploy.yml"
    log "Using deprecated fallback compose file: $COMPOSE_FILE"
  fi

  if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERROR: compose file not found: $COMPOSE_FILE" >&2
    exit 1
  fi

  upsert_env "IMAGE_TAG" "$IMAGE_TAG"
  if [ -n "$DOCKERHUB_NAMESPACE" ]; then
    upsert_env "DOCKERHUB_NAMESPACE" "$DOCKERHUB_NAMESPACE"
  fi

  log "Using IMAGE_TAG=$IMAGE_TAG"
  log "Using COMPOSE_FILE=$COMPOSE_FILE"

  local refresh_script="$SCRIPT_DIR/refresh-public-ip-and-redeploy.sh"
  local use_ip_refresh="${USE_IP_REFRESH:-true}"
  local deployed_with_refresh="false"

  if [ "$use_ip_refresh" = "true" ] && [ -x "$refresh_script" ]; then
    log "Running IP refresh + compose deploy flow"
    if AUTO_PULL_IMAGES=true DEPLOY_DIR="$DEPLOY_DIR" ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" "$refresh_script"; then
      deployed_with_refresh="true"
    else
      log "IP refresh flow failed. Falling back to compose pull/up"
    fi
  fi

  if [ "$deployed_with_refresh" != "true" ]; then
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
  fi

  log "Container status"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

  if curl -fsS "http://localhost/api/health" >/dev/null 2>&1; then
    log "Health check OK: http://localhost/api/health"
    exit 0
  fi

  if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
    log "Health check OK: http://localhost:8000/health"
    exit 0
  fi

  echo "ERROR: health check failed after deployment." >&2
  exit 1
}

main "$@"
