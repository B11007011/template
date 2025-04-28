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
    # Optional explicit bucket name
    firebase_storage_bucket = os.environ.get('FIREBASE_STORAGE_BUCKET')
    
    # Debug output (without revealing sensitive info)
    print(f"FIREBASE_PROJECT_ID: {'SET' if firebase_project_id else 'NOT SET'}")
    if firebase_project_id:
        print(f"Project ID value: {firebase_project_id}")
    print(f"FIREBASE_SERVICE_ACCOUNT_BASE64: {'SET' if service_account_base64 else 'NOT SET'}")
    print(f"FIREBASE_STORAGE_BUCKET: {'SET' if firebase_storage_bucket else 'NOT SET'}")
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
                    
                # Print service account email for verification
                service_account_email = service_account_data.get('client_email')
                if service_account_email:
                    print(f"Service account email: {service_account_email}")
                    print("If uploads fail, verify this account has Storage Admin permission in the Firebase Console")
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
        
        # Try different bucket format approaches
        try:
            # If explicit bucket name is provided, use it
            if firebase_storage_bucket:
                # Remove gs:// prefix if present
                if firebase_storage_bucket.startswith('gs://'):
                    firebase_storage_bucket = firebase_storage_bucket[5:]
                    
                firebase_admin.initialize_app(cred, {
                    'storageBucket': firebase_storage_bucket
                })
                print(f"Initialized Firebase app with explicit bucket: {firebase_storage_bucket}")
            else:
                # Approach 1: Using the standard project ID based bucket name
                firebase_admin.initialize_app(cred, {
                    'storageBucket': f"{firebase_project_id}.appspot.com"
                })
                print(f"Initialized Firebase app with bucket: {firebase_project_id}.appspot.com")
        except Exception as e1:
            # Cleanup previous failed attempt
            if firebase_admin._apps:
                firebase_admin.delete_app(firebase_admin.get_app())
                
            try:
                # Approach 2: Using just the project ID as bucket name
                firebase_admin.initialize_app(cred, {
                    'storageBucket': firebase_project_id
                })
                print(f"Initialized Firebase app with bucket: {firebase_project_id}")
            except Exception as e2:
                # If both approaches fail, try without explicitly setting the bucket
                print(f"Error initializing with bucket name: {e1}")
                print(f"Error initializing with project ID as bucket: {e2}")
                print("Attempting to initialize without explicit bucket...")
                
                # Initialize without bucket
                firebase_admin.initialize_app(cred)
                
                # Try to get default bucket
                try:
                    from firebase_admin import storage
                    bucket = storage.bucket()
                    print(f"Successfully got default bucket: {bucket.name}")
                except Exception as e3:
                    print(f"Failed to get default bucket: {e3}")
                    print("Unable to determine the correct Firebase Storage bucket.")
                    print("Please verify your Firebase Storage setup in the Firebase Console.")
                    raise Exception("Failed to initialize Firebase Storage bucket") from e3
        
        # If we get here, try to access the bucket
        bucket = storage.bucket()
        print(f"Successfully connected to bucket: {bucket.name}")
        
        # Test bucket existence/permissions with a small operation
        test_blob = bucket.blob('test-connection.txt')
        test_blob.upload_from_string('Test connection', content_type='text/plain')
        test_blob.delete()
        print("Successfully verified bucket permissions with test operation")
        
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
        # Provide more helpful info for common errors
        if "The specified bucket does not exist" in str(e):
            print("\n===== FIREBASE STORAGE SETUP HELP =====")
            print("It looks like your Firebase Storage might not be set up correctly.")
            print("Please follow these steps:")
            print("1. Go to https://console.firebase.google.com/project/" + firebase_project_id + "/storage")
            print("2. Click 'Get Started' if you haven't set up Storage yet")
            print("3. Choose a location and click 'Next'")
            print("4. Select 'Start in production mode' or 'Start in test mode'")
            print("5. Click 'Done' to create your Storage bucket")
            print("\nAlso verify that your service account has the 'Storage Admin' role:")
            print("1. Go to https://console.cloud.google.com/iam-admin/iam?project=" + firebase_project_id)
            print("2. Find your service account in the list")
            print("3. Add the 'Storage Admin' role if it's not already assigned")
            print("=====================================\n")
        
        # Clean up in case of error
        if os.path.exists(temp_key_path):
            os.remove(temp_key_path)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 