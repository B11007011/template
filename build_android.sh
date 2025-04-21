#!/bin/bash

# Script to build and install Android app
echo "========== Cleaning previous builds =========="
flutter clean

echo "========== Getting packages =========="
flutter pub get

echo "========== Building debug APK =========="
flutter build apk --debug --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"

echo "========== Installing new app version =========="
# Use flutter install which handles device detection and installation
flutter install --debug

echo "========== Build completed ==========" 