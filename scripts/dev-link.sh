#!/bin/sh
set -eu

DEFAULT_SOURCE="../elixir-live-claude-engineer"
SOURCE="${1:-$DEFAULT_SOURCE}"
TARGET="./plugin-source"

if [ -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
  echo "[dev-link] $TARGET exists and is not a symlink — refusing to overwrite"
  exit 1
fi

if [ ! -d "$SOURCE" ]; then
  echo "[dev-link] source $SOURCE not found"
  echo "Pass a path: ./scripts/dev-link.sh /path/to/claude-elixir-phoenix"
  exit 1
fi

rm -f "$TARGET"
ln -s "$SOURCE" "$TARGET"
echo "[dev-link] linked $TARGET -> $SOURCE"
