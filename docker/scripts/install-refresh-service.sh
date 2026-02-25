#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="community-compose-refresh.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "ERROR: run as root (sudo)." >&2
  exit 1
fi

DEPLOY_DOCKER_DIR="${1:-}"
if [ -z "$DEPLOY_DOCKER_DIR" ]; then
  echo "Usage: sudo $0 <deploy-docker-dir>"
  echo "Example: sudo $0 /home/ubuntu/community/docker"
  exit 1
fi

SCRIPT_PATH="${DEPLOY_DOCKER_DIR%/}/scripts/refresh-public-ip-and-redeploy.sh"

if [ ! -x "$SCRIPT_PATH" ]; then
  echo "ERROR: executable script not found: $SCRIPT_PATH" >&2
  echo "Run: chmod +x ${SCRIPT_PATH}" >&2
  exit 1
fi

cat > "$SERVICE_PATH" <<EOF
[Unit]
Description=Refresh EC2 public IP in ALLOWED_ORIGINS and redeploy docker compose
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=oneshot
ExecStart=${SCRIPT_PATH}
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo "Installed: $SERVICE_PATH"
echo "Enabled: $SERVICE_NAME"
echo "Run now: sudo systemctl start $SERVICE_NAME"
echo "Check:   sudo systemctl status $SERVICE_NAME --no-pager"
