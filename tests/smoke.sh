#!/usr/bin/env bash
# ============================================================
# tests/smoke.sh — Production smoke test
# ============================================================
# Phase 3 Step 7. Hits the live URL after deploy and verifies the
# things we hardened in Step 3: security headers, CSP, and that the
# backend proxy route works end-to-end through Flycast.
#
# Usage:
#   bash tests/smoke.sh https://nextsound-louisgee8.fly.dev
#   bash tests/smoke.sh http://localhost:8080  # local docker-compose
#
# Pattern adapted from rag-api/tests/smoke.sh. Exits non-zero on any
# failure so GitHub Actions catches it.
# ============================================================

set -euo pipefail

BASE_URL="${1:-https://nextsound-louisgee8.fly.dev}"
PASS=0
FAIL=0

ok()   { echo "  ✓ $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL+1)); }

echo "=========================================="
echo "Smoke test against: $BASE_URL"
echo "=========================================="

# ----------------------------------------------------------
# 1. GET / returns 200 with HTML
# ----------------------------------------------------------
echo ""
echo "[1/4] Frontend reachability"
http_code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/")
[ "$http_code" = "200" ] && ok "GET / returns 200" || fail "GET / returned $http_code"

# ----------------------------------------------------------
# 2. Security headers present (Phase 3 Step 3 Pass 1)
# ----------------------------------------------------------
echo ""
echo "[2/4] Security headers"
headers=$(curl -sSI "$BASE_URL/")

for h in "X-Frame-Options: DENY" \
         "X-Content-Type-Options: nosniff" \
         "Referrer-Policy: strict-origin-when-cross-origin" \
         "Strict-Transport-Security: max-age="; do
  if echo "$headers" | grep -iq "$h"; then
    ok "Header present: $h"
  else
    fail "Header MISSING: $h"
  fi
done

# ----------------------------------------------------------
# 3. CSP present (Phase 3 Step 3 Pass 2)
# ----------------------------------------------------------
echo ""
echo "[3/4] Content-Security-Policy"
if echo "$headers" | grep -iq "content-security-policy:"; then
  csp=$(echo "$headers" | grep -i "content-security-policy:" | head -1)
  for directive in "default-src 'self'" "script-src 'self'" "frame-ancestors 'none'" "object-src 'none'"; do
    if echo "$csp" | grep -q "$directive"; then
      ok "CSP includes: $directive"
    else
      fail "CSP MISSING: $directive"
    fi
  done
else
  fail "Content-Security-Policy header absent"
fi

# ----------------------------------------------------------
# 4. /api/spotify/search proxied through to live backend
#    (Sparingly! Cheap query, hit Spotify quota minimally.)
# ----------------------------------------------------------
echo ""
echo "[4/4] Backend proxy route (live Spotify call)"
api_code=$(curl -sS -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/spotify/search?q=phase3test&type=track&limit=1")
[ "$api_code" = "200" ] && ok "GET /api/spotify/search returns 200" || fail "GET /api/spotify/search returned $api_code"

# ----------------------------------------------------------
# Summary
# ----------------------------------------------------------
echo ""
echo "=========================================="
echo "PASS: $PASS    FAIL: $FAIL"
echo "=========================================="

[ "$FAIL" -eq 0 ] || exit 1
