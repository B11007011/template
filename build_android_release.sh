#!/bin/bash

# Script to build release Android app
echo "========== Cleaning previous builds =========="
flutter clean

echo "========== Getting packages =========="
flutter pub get

echo "========== Building Release APK =========="
flutter build apk --release --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"

echo "========== Building App Bundle (AAB) for Play Store =========="
flutter build appbundle --release --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"

echo "========== Build completed =========="
echo "APK location: $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
echo "AAB location: $(pwd)/build/app/outputs/bundle/release/app-release.aab" 