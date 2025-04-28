#!/bin/bash

# Script to build and install Android app in debug mode
echo "========== Cleaning previous builds =========="
flutter clean

echo "========== Getting packages =========="
flutter pub get

echo "========== Building debug APK =========="
flutter build apk --debug --dart-define=APP_NAME="WebView App" --dart-define=WEBVIEW_URL="https://flutter.dev"

if [ $? -eq 0 ]; then
  echo "========== Debug build successful =========="
  echo "APK location: $(pwd)/build/app/outputs/flutter-apk/app-debug.apk"
  
  echo "========== Installing debug APK =========="
  flutter install --debug
  
  echo "========== Installation completed =========="
else
  echo "========== Build failed! =========="
  echo "Please check the error messages above"
fi 