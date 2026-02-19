#!/usr/bin/env bash
set -euo pipefail

REQUIRED=(rg bwrap socat)
MISSING=()
for cmd in "${REQUIRED[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    MISSING+=("$cmd")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✅ Sandbox dependencies present: ${REQUIRED[*]}"
  exit 0
fi

echo "⚠️  Missing sandbox dependencies: ${MISSING[*]}"
echo
cat <<'MSG'
These binaries are required by the Codespaces / local sandbox used by Vitest and the VS Code sandbox runtime.
Install them inside the container or on your host and then rebuild the devcontainer.

Alpine:
  apk add --no-cache <missing-packages>

Debian/Ubuntu:
  sudo apt-get update && sudo apt-get install -y <missing-packages>

To rebuild the devcontainer in VS Code: Command Palette → Dev Containers: Rebuild Container
MSG

echo
echo "Suggested install command(s):"
if [ -x "$(command -v apk || true)" ]; then
  echo "  apk add --no-cache ${MISSING[*]}"
else
  echo "  sudo apt-get update && sudo apt-get install -y ${MISSING[*]}"
fi

# Fail so the postCreateCommand surfaces the missing deps during container setup
exit 1
