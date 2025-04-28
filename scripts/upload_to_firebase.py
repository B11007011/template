#!/usr/bin/env python3

import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, storage
import base64

def main():
    print("Starting Firebase Storage upload script...")
    
    # Get parameters from environment
    firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID')
    service_account_base64 = os.environ.get('FIREBASE_SERVICE_ACCOUNT_BASE64')
    build_id = os.environ.get('BUILD_ID')
    
    # Debug output (without revealing sensitive info)
    print(f"FIREBASE_PROJECT_ID: {'SET' if firebase_project_id else 'NOT SET'}")
    if firebase_project_id:
        print(f"Project ID value: {firebase_project_id}")
    print(f"FIREBASE_SERVICE_ACCOUNT_BASE64: {'SET' if service_account_base64 else 'NOT SET'}")
    print(f"BUILD_ID: {build_id if build_id else 'NOT SET'}")
    
    # Path to files that need to be uploaded
    apk_path = 'build/app/outputs/flutter-apk/app-release.apk'
    aab_path = 'build/app/outputs/bundle/release/app-release.aab'
    
    # Validate service account and build ID
    missing_vars = []
    if not service_account_base64:
        missing_vars.append("FIREBASE_SERVICE_ACCOUNT_BASE64")
    if not build_id:
        missing_vars.append("BUILD_ID")
    
    if missing_vars:
        print("Error: Missing required environment variables.")
        print(f"Required: {', '.join(missing_vars)}")
        sys.exit(1)
    
    # Decode the base64 service account key
    try:
        service_account_json = base64.b64decode(service_account_base64)
        
        # If FIREBASE_PROJECT_ID is not set, try to extract it from the service account
        if not firebase_project_id:
            print("Attempting to extract project ID from service account key...")
            try:
                service_account_data = json.loads(service_account_json)
                extracted_project_id = service_account_data.get('project_id')
                if extracted_project_id:
                    firebase_project_id = extracted_project_id
                    print(f"Successfully extracted project ID: {firebase_project_id}")
                else:
                    print("Error: Could not find project_id in service account key")
                    sys.exit(1)
            except json.JSONDecodeError:
                print("Error: Invalid service account key JSON format")
                sys.exit(1)
    except Exception as e:
        print(f"Error decoding service account key: {e}")
        sys.exit(1)
    
    # Check if files exist
    if not os.path.exists(apk_path):
        print(f"Warning: APK file not found at {apk_path}")
    
    if not os.path.exists(aab_path):
        print(f"Warning: AAB file not found at {aab_path}")
    
    if not os.path.exists(apk_path) and not os.path.exists(aab_path):
        print("Error: No build artifacts found to upload")
        sys.exit(1)
    
    # Build path in Firebase Storage
    build_path = f"builds/{build_id}"
    
    # Save the service account key to a temporary file
    temp_key_path = "/tmp/firebase-service-account.json"
    try:
        with open(temp_key_path, 'wb') as f:
            f.write(service_account_json)
    except Exception as e:
        print(f"Error writing service account key to temp file: {e}")
        sys.exit(1)
    
    # Initialize Firebase app
    try:
        cred = credentials.Certificate(temp_key_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{firebase_project_id}.appspot.com"
        })
        
        bucket = storage.bucket()
        
        # Upload APK
        if os.path.exists(apk_path):
            print(f"Uploading APK from {apk_path}...")
            blob = bucket.blob(f"{build_path}/app.apk")
            blob.upload_from_filename(apk_path)
            blob.make_public()
            print(f"APK uploaded to: {blob.public_url}")
            # Set environment variable for GitHub Actions
            github_env = os.environ.get('GITHUB_ENV')
            if github_env:
                try:
                    with open(github_env, 'a') as env_file:
                        env_file.write(f"APK_URL={blob.public_url}\n")
                except Exception as e:
                    print(f"Warning: Could not write to GITHUB_ENV: {e}")
            else:
                print("Warning: GITHUB_ENV not set, cannot persist APK_URL")
        
        # Upload AAB
        if os.path.exists(aab_path):
            print(f"Uploading AAB from {aab_path}...")
            blob = bucket.blob(f"{build_path}/app.aab")
            blob.upload_from_filename(aab_path)
            blob.make_public()
            print(f"AAB uploaded to: {blob.public_url}")
            # Set environment variable for GitHub Actions
            github_env = os.environ.get('GITHUB_ENV')
            if github_env:
                try:
                    with open(github_env, 'a') as env_file:
                        env_file.write(f"AAB_URL={blob.public_url}\n")
                        env_file.write(f"BUILD_PATH={build_path}\n")
                except Exception as e:
                    print(f"Warning: Could not write to GITHUB_ENV: {e}")
            else:
                print("Warning: GITHUB_ENV not set, cannot persist AAB_URL and BUILD_PATH")
        
        # Clean up
        os.remove(temp_key_path)
        print("Upload completed successfully!")
        return 0
        
    except Exception as e:
        print(f"Error during Firebase upload: {e}")
        # Clean up in case of error
        if os.path.exists(temp_key_path):
            os.remove(temp_key_path)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 