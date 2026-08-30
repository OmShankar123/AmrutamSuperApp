#!/bin/bash
set -e

echo "🌿 [Amrutam SuperApp] Starting Standalone Android Release APK Pipeline..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "⚙️ Step 1/3: Running Expo Prebuild..."
npx expo prebuild --clean

echo "🧹 Step 2/3: Cleaning Gradle cache..."
cd "$ROOT_DIR/android"
./gradlew clean

echo "📦 Step 3/3: Building Signed Release APK (assembleRelease)..."
./gradlew assembleRelease

APK_PATH="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  echo ""
  echo "=========================================================="
  echo "✅ Release APK Built Successfully!"
  echo "📍 Location: $APK_PATH"
  ls -lh "$APK_PATH"
  echo "=========================================================="
else
  echo "⚠️ Build finished. Check output directory: $ROOT_DIR/android/app/build/outputs/apk/release/"
fi
