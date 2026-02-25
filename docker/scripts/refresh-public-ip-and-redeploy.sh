#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
ENV_FILE="${ENV_FILE:-$DEPLOY_DIR/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_DIR/docker-compose.yml}"

ORIGIN_SCHEME="${ORIGIN_SCHEME:-http}"
INCLUDE_LOCAL_ORIGINS="${INCLUDE_LOCAL_ORIGINS:-true}"
INCLUDE_HTTPS_IP="${INCLUDE_HTTPS_IP:-false}"
AUTO_PULL_IMAGES="${AUTO_PULL_IMAGES:-false}"

log() {
  echo "[ip-refresh] $*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

is_ipv4_origin() {
  local origin="$1"
  [[ "$origin" =~ ^https?://([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]
}

add_unique_origin() {
  local candidate="$1"
  [ -n "$candidate" ] || return 0
  if [[ -z "${ORIGIN_SEEN[$candidate]:-}" ]]; then
    ORIGIN_LIST+=("$candidate")
    ORIGIN_SEEN["$candidate"]=1
  fi
}

fetch_public_ip() {
  local token ip

  token="$(curl -fsS -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)"

  if [ -n "$token" ]; then
    ip="$(curl -fsS -H "X-aws-ec2-metadata-token: $token" \
      "http://169.254.169.254/latest/meta-data/public-ipv4" || true)"
  else
    ip="$(curl -fsS "http://169.254.169.254/latest/meta-data/public-ipv4" || true)"
  fi

  if [ -z "$ip" ]; then
    echo "ERROR: failed to fetch public IPv4 from EC2 metadata (IMDS)." >&2
    exit 1
  fi

  if ! [[ "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    echo "ERROR: invalid IPv4 from metadata: $ip" >&2
    exit 1
  fi

  printf '%s' "$ip"
}

rewrite_allowed_origins() {
  local public_ip="$1"
  local current_value=""
  local new_value

  if grep -q '^ALLOWED_ORIGINS=' "$ENV_FILE"; then
    current_value="$(grep -E '^ALLOWED_ORIGINS=' "$ENV_FILE" | head -n1 | cut -d'=' -f2-)"
  fi

  declare -gA ORIGIN_SEEN=()
  declare -ga ORIGIN_LIST=()

  add_unique_origin "${ORIGIN_SCHEME}://${public_ip}"

  if [ "$INCLUDE_HTTPS_IP" = "true" ]; then
    add_unique_origin "https://${public_ip}"
  fi

  if [ "$INCLUDE_LOCAL_ORIGINS" = "true" ]; then
    add_unique_origin "http://localhost"
    add_unique_origin "http://127.0.0.1"
  fi

  IFS=',' read -r -a current_origins <<< "$current_value"
  for origin in "${current_origins[@]}"; do
    origin="$(trim "$origin")"
    [ -n "$origin" ] || continue

    if is_ipv4_origin "$origin"; then
      continue
    fi

    if [[ "$origin" == "http://localhost" || "$origin" == "http://127.0.0.1" ]]; then
      continue
    fi

    add_unique_origin "$origin"
  done

  new_value="$(IFS=','; echo "${ORIGIN_LIST[*]}")"

  awk -v val="$new_value" '
    BEGIN { updated = 0 }
    /^ALLOWED_ORIGINS=/ {
      print "ALLOWED_ORIGINS=" val
      updated = 1
      next
    }
    { print }
    END {
      if (!updated) {
        print "ALLOWED_ORIGINS=" val
      }
    }
  ' "$ENV_FILE" > "${ENV_FILE}.tmp"

  mv "${ENV_FILE}.tmp" "$ENV_FILE"

  log "ALLOWED_ORIGINS updated to: $new_value"
}

main() {
  require_command curl
  require_command docker
  require_command awk
  require_command grep

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

  local public_ip
  public_ip="$(fetch_public_ip)"
  log "Detected EC2 public IPv4: $public_ip"

  rewrite_allowed_origins "$public_ip"

  if [ "$AUTO_PULL_IMAGES" = "true" ]; then
    log "Pulling latest images..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
  fi

  log "Applying docker compose..."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
  log "Done."
}

main "$@"
