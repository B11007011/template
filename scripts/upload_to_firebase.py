#!/usr/bin/env python3

import os
import sys
import firebase_admin
from firebase_admin import credentials, storage
import base64

def main():
    # Get parameters from environment
    firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID')
    service_account_base64 = os.environ.get('FIREBASE_SERVICE_ACCOUNT_BASE64')
    build_id = os.environ.get('BUILD_ID')
    
    # Path to files that need to be uploaded
    apk_path = 'build/app/outputs/flutter-apk/app-release.apk'
    aab_path = 'build/app/outputs/bundle/release/app-release.aab'
    
    # Destination path in Firebase Storage
    build_path = f"builds/{build_id}"
    
    # Validate parameters
    if not all([firebase_project_id, service_account_base64, build_id]):
        print("Error: Missing required environment variables.")
        print("Required: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_BASE64, BUILD_ID")
        sys.exit(1)
    
    # Decode the base64 service account key
    service_account_json = base64.b64decode(service_account_base64)
    
    # Save the service account key to a temporary file
    temp_key_path = "/tmp/firebase-service-account.json"
    with open(temp_key_path, 'wb') as f:
        f.write(service_account_json)
    
    # Initialize Firebase app
    try:
        cred = credentials.Certificate(temp_key_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{firebase_project_id}.appspot.com"
        })
        
        bucket = storage.bucket()
        
        # Upload APK
        if os.path.exists(apk_path):
            blob = bucket.blob(f"{build_path}/app.apk")
            blob.upload_from_filename(apk_path)
            blob.make_public()
            print(f"APK uploaded to: {blob.public_url}")
            # Set environment variable for GitHub Actions
            with open(os.environ.get('GITHUB_ENV', ''), 'a') as env_file:
                env_file.write(f"APK_URL={blob.public_url}\n")
        else:
            print(f"Warning: APK file not found at {apk_path}")
        
        # Upload AAB
        if os.path.exists(aab_path):
            blob = bucket.blob(f"{build_path}/app.aab")
            blob.upload_from_filename(aab_path)
            blob.make_public()
            print(f"AAB uploaded to: {blob.public_url}")
            # Set environment variable for GitHub Actions
            with open(os.environ.get('GITHUB_ENV', ''), 'a') as env_file:
                env_file.write(f"AAB_URL={blob.public_url}\n")
                env_file.write(f"BUILD_PATH={build_path}\n")
        else:
            print(f"Warning: AAB file not found at {aab_path}")
        
        # Clean up
        os.remove(temp_key_path)
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        # Clean up in case of error
        if os.path.exists(temp_key_path):
            os.remove(temp_key_path)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 