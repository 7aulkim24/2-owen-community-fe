#!/bin/bash

set -euo pipefail

FE_URL="${1:-http://localhost}"

assert_status() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  if [ "$expected" != "$actual" ]; then
    echo "[FAIL] $label: expected=$expected actual=$actual"
    exit 1
  fi
  echo "[PASS] $label ($actual)"
}

echo "QA Smoke 시작: $FE_URL"

posts_status=$(curl -sS -o /tmp/community_posts.html -w "%{http_code}" "$FE_URL/posts.html")
assert_status 200 "$posts_status" "GET /posts.html"

if ! grep -q "AWS AI School 2기" /tmp/community_posts.html; then
  echo "[FAIL] posts.html 내용 검증 실패"
  exit 1
fi
echo "[PASS] posts.html 내용 검증"

health_status=$(curl -sS -o /tmp/community_health.json -w "%{http_code}" "$FE_URL/api/health")
assert_status 200 "$health_status" "GET /api/health"

posts_api_status=$(curl -sS -o /tmp/community_posts_api.json -w "%{http_code}" "$FE_URL/api/v1/posts?offset=0&limit=5")
assert_status 200 "$posts_api_status" "GET /api/v1/posts"

echo "QA Smoke 완료"
