#!/bin/bash

# Script to build release Android app
echo "========== Cleaning previous builds =========="
flutter clean

echo "========== Getting packages =========="
flutter pub get

echo "========== Attempting to uninstall previous app versions =========="
# Try to uninstall previous apps if they exist, but don't fail if they don't
adb uninstall com.example.template || echo "App not found or ADB not available"
adb uninstall com.example.webview_app || echo "App not found or ADB not available"

echo "========== Building Release APK =========="
flutter build apk --release --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"

if [ $? -eq 0 ]; then
  echo "========== Build successful =========="
  echo "APK location: $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
  
  # Try to install the APK
  echo "========== Installing release APK for testing =========="
  flutter install --release || adb install build/app/outputs/flutter-apk/app-release.apk || echo "Installation failed - please install manually"
  
  echo "========== Building App Bundle (AAB) for Play Store =========="
  flutter build appbundle --release --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"
  
  if [ $? -eq 0 ]; then
    echo "AAB location: $(pwd)/build/app/outputs/bundle/release/app-release.aab"
  else
    echo "AAB build failed"
  fi
  
else
  echo "========== Build failed! =========="
  echo "Please check the error messages above"
fi 