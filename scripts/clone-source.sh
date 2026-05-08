#!/bin/sh
set -eu

REPO_URL="https://github.com/oliver-kriska/claude-elixir-phoenix.git"
TARGET_DIR="./plugin-source"

if [ -L "$TARGET_DIR" ]; then
  echo "[clone-source] $TARGET_DIR is a symlink (local dev) — skipping clone"
  exit 0
fi

if [ -d "$TARGET_DIR" ]; then
  echo "[clone-source] $TARGET_DIR exists — refreshing"
  cd "$TARGET_DIR" && git fetch --depth 1 origin main && git reset --hard origin/main
else
  echo "[clone-source] cloning $REPO_URL"
  git clone --depth 1 --branch main "$REPO_URL" "$TARGET_DIR"
fi

echo "[clone-source] done"
