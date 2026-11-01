#!/usr/bin/env bash
# Fetch the standalone Spectral CLI at a pinned version and verify it against a pinned SHA-256
# before it is ever executed (ADR-0002). Same pattern as gitleaks in ci.yml: no npm install of
# Spectral, so its bundler's dependency tree never enters this repo's lockfile.
#
# Bump SPECTRAL_VERSION and SPECTRAL_SHA256 together. The digest is published by GitHub on the
# release asset:
#   gh api repos/stoplightio/spectral/releases/tags/v<version> \
#     -q '.assets[]|select(.name=="spectral-linux-x64")|.digest'
set -euo pipefail

SPECTRAL_VERSION="6.17.0"
SPECTRAL_SHA256="e6244baecff57dfb89ba8379a09563270fbb4ac7f73fb8692510a6160059ec53" # spectral-linux-x64

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) asset="spectral-linux-x64" ;;
  *)
    echo "install-spectral: only linux-x64 is pinned. Set SPECTRAL_BIN to your own Spectral $SPECTRAL_VERSION." >&2
    exit 1
    ;;
esac

root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/.tools/spectral"
if [ -x "$dest" ] && echo "${SPECTRAL_SHA256}  $dest" | sha256sum -c --status -; then
  echo "install-spectral: $dest already at $SPECTRAL_VERSION"
  exit 0
fi

mkdir -p "$root/.tools"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
curl -fsSL -o "$tmp" "https://github.com/stoplightio/spectral/releases/download/v${SPECTRAL_VERSION}/${asset}"
echo "${SPECTRAL_SHA256}  $tmp" | sha256sum -c -
install -m 0755 "$tmp" "$dest"
echo "install-spectral: installed $("$dest" --version) at $dest"
