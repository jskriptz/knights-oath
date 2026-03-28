#!/bin/bash
# sync-www.sh — Copy web assets to www/ folder for Capacitor
# Run this before npx cap sync android

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WWW_DIR="$PROJECT_ROOT/www"

echo "Syncing web assets to www/..."

# Create www folder if it doesn't exist
mkdir -p "$WWW_DIR"

# Remove old files (but not the folder itself)
rm -rf "$WWW_DIR"/*

# Copy web assets (real files, not symlinks)
cp "$PROJECT_ROOT/index.html" "$WWW_DIR/"
cp "$PROJECT_ROOT/sw.js" "$WWW_DIR/"
cp "$PROJECT_ROOT/manifest.json" "$WWW_DIR/"
cp -r "$PROJECT_ROOT/campaigns" "$WWW_DIR/"

echo ""
echo "Copied to www/:"
echo "  - index.html"
echo "  - sw.js"
echo "  - manifest.json"
echo "  - campaigns/ ($(find "$WWW_DIR/campaigns" -name "*.json" | wc -l) JSON files)"
echo ""
echo "www/ sync complete."
