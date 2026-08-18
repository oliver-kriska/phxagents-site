#!/bin/sh
set -eu

REPO_URL="https://github.com/oliver-kriska/claude-elixir-phoenix.git"
TARGET_DIR="./plugin-source"

if [ -L "$TARGET_DIR" ]; then
  echo "[clone-source] $TARGET_DIR is a symlink (local dev) — skipping clone"
  exit 0
fi

if [ -d "$TARGET_DIR" ]; then
  echo "[clone-source] $TARGET_DIR exists — refreshing full history"
  if [ "$(git -C "$TARGET_DIR" rev-parse --is-shallow-repository)" = "true" ]; then
    git -C "$TARGET_DIR" fetch --unshallow origin main
  else
    git -C "$TARGET_DIR" fetch origin main
  fi
  git -C "$TARGET_DIR" reset --hard origin/main
else
  echo "[clone-source] cloning $REPO_URL with full history for per-page dates"
  git clone --branch main "$REPO_URL" "$TARGET_DIR"
fi

echo "[clone-source] done"
