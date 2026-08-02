#!/bin/bash
# scripts/deploy-bundle.sh
# Jalankan setelah: npm run build
#
# Usage: bash scripts/deploy-bundle.sh 2.1.0
#
# Script ini akan:
#   1. Zip isi dist/ menjadi bundles/tomat-<version>.zip
#   2. Hitung SHA256 checksum
#   3. Tampilkan nilai yang perlu diupdate di server/app-version.js

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: bash scripts/deploy-bundle.sh <version>"
  echo "  contoh: bash scripts/deploy-bundle.sh 2.1.0"
  exit 1
fi

BUNDLE_NAME="tomat-${VERSION}.zip"
DIST_DIR="dist"
BUNDLE_DIR="bundles"

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Folder '$DIST_DIR' tidak ditemukan. Jalankan 'npm run build' terlebih dahulu."
  exit 1
fi

mkdir -p "$BUNDLE_DIR"

# Zip bundle
echo "📦 Membuat bundle ${BUNDLE_NAME}..."
cd "$DIST_DIR" && zip -r "../${BUNDLE_DIR}/${BUNDLE_NAME}" . --quiet && cd ..

# Hitung checksum dan ukuran
CHECKSUM=$(sha256sum "${BUNDLE_DIR}/${BUNDLE_NAME}" | awk '{print $1}')
SIZE=$(stat -c%s "${BUNDLE_DIR}/${BUNDLE_NAME}" 2>/dev/null || stat -f%z "${BUNDLE_DIR}/${BUNDLE_NAME}")

echo ""
echo "✅ Bundle berhasil dibuat: ${BUNDLE_DIR}/${BUNDLE_NAME}"
echo "   Ukuran : ${SIZE} bytes"
echo "   SHA256 : ${CHECKSUM}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Update nilai berikut di server/app-version.js:"
echo ""
echo "  bundleVersion: '${VERSION}',"
echo "  bundleUrl: 'https://your-server.com/bundles/${BUNDLE_NAME}',"
echo "  bundleSize: ${SIZE},"
echo "  bundleChecksum: 'sha256:${CHECKSUM}',"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Setelah update server/app-version.js, upload bundle ke server:"
echo "   scp ${BUNDLE_DIR}/${BUNDLE_NAME} user@your-server.com:/var/www/bundles/"
echo ""
echo "💡 Catatan: Server TOMAT sudah serve /bundles via express.static."
echo "   Pastikan folder 'bundles/' ada di root project di server produksi."
