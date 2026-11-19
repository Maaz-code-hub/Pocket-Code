#!/usr/bin/env bash
# Builds the DevLocker Android app → dist/DevLocker.apk
#
# First run also:
#   - creates the signing key  android/devlocker.keystore  (BACK IT UP: without
#     it you can't ship updates that install over the old app)
#   - writes public/.well-known/assetlinks.json — commit & push it so the app
#     opens full-screen without Chrome's address bar.
#
# Needs: JDK 17 and the Android SDK (ANDROID_HOME, default ~/Android/Sdk).
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$PWD
AND=$ROOT/android

export ANDROID_HOME=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}
# Use a JDK that isn't on PATH if one is in a known spot.
if ! command -v java >/dev/null; then
  for j in "${JAVA_HOME:-}" "$HOME/.local/jdk/jdk17" /usr/lib/jvm/java-17-openjdk; do
    if [ -n "$j" ] && [ -x "$j/bin/java" ]; then export JAVA_HOME=$j PATH=$j/bin:$PATH; break; fi
  done
fi
command -v java >/dev/null || { echo "✗ Java not found — install JDK 17 (e.g. sudo pacman -S jdk17-openjdk)"; exit 1; }
command -v keytool >/dev/null || { echo "✗ keytool not found — install a full JDK 17"; exit 1; }
[ -d "$ANDROID_HOME/platforms" ] || { echo "✗ Android SDK not found at $ANDROID_HOME — set ANDROID_HOME"; exit 1; }
echo "sdk.dir=$ANDROID_HOME" > "$AND/local.properties"

# ---- Signing key (once) ----
if [ ! -f "$AND/keystore.properties" ]; then
  echo "→ Creating signing key android/devlocker.keystore"
  PASS=$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)
  keytool -genkeypair -v -keystore "$AND/devlocker.keystore" -alias devlocker \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" -dname "CN=DevLocker" >/dev/null 2>&1
  cat > "$AND/keystore.properties" <<EOF
storeFile=devlocker.keystore
storePassword=$PASS
keyAlias=devlocker
keyPassword=$PASS
EOF
  chmod 600 "$AND/keystore.properties" "$AND/devlocker.keystore"
fi
PASS=$(grep '^storePassword=' "$AND/keystore.properties" | cut -d= -f2-)

# ---- Gradle wrapper (once) ----
if [ ! -f "$AND/gradlew" ]; then
  echo "→ Setting up the Gradle wrapper"
  GRADLE=$(command -v gradle || ls -d "$HOME"/.gradle/wrapper/dists/gradle-8.9-bin/*/gradle-8.9/bin/gradle 2>/dev/null | head -1 || true)
  [ -n "$GRADLE" ] || { echo "✗ Gradle not found — install it once (sudo pacman -S gradle) to create the wrapper"; exit 1; }
  (cd "$AND" && "$GRADLE" wrapper --gradle-version 8.9 --no-daemon -q)
fi

# ---- Build ----
echo "→ Building (the first build downloads dependencies and takes a few minutes)"
(cd "$AND" && ./gradlew assembleRelease --no-daemon -q)
mkdir -p "$ROOT/dist"
cp "$AND/app/build/outputs/apk/release/app-release.apk" "$ROOT/dist/DevLocker.apk"

# ---- Digital Asset Links (proves the app and the site belong together) ----
SHA=$(keytool -list -v -keystore "$AND/devlocker.keystore" -alias devlocker -storepass "$PASS" \
  | grep -m1 'SHA256:' | sed 's/.*SHA256: *//')
mkdir -p "$ROOT/public/.well-known"
cat > "$ROOT/public/.well-known/assetlinks.json" <<EOF
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.netlify.devlocker",
    "sha256_cert_fingerprints": ["$SHA"]
  }
}]
EOF

echo
echo "✓ APK: dist/DevLocker.apk"
echo "✓ public/.well-known/assetlinks.json written (fingerprint $SHA)"
echo "  Commit & push it so the app opens without the address bar."
echo "  Back up android/devlocker.keystore + android/keystore.properties somewhere safe."
