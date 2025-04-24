# WebView App Builder Frontend

This is a simple HTML-based frontend that allows you to trigger GitHub Actions workflow for building Android WebView apps and download the resulting APKs.

## Features

- Trigger Android app builds through GitHub Actions
- Configure app name and WebView URL
- Monitor build status
- Download APK files directly or via QR code
- View build history
- Multiple API methods for triggering builds
- Firebase Firestore integration for build status tracking

## Installation and Setup

1. Install Node.js if you don't have it already
2. Navigate to the frontend directory in your terminal
3. Install dependencies:
   ```
   npm install
   ```

4. **Configure your GitHub token and Firebase** (choose one method):

   ### Option 1: Using .env file (recommended)
   
   Create a `.env` file in the frontend directory with the following content:
   
   ```
   # GitHub Configuration
   GITHUB_REPOSITORY=username/repo-name
   GITHUB_TOKEN=your_personal_access_token
   
   # Firebase Configuration (optional)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key goes here\n-----END PRIVATE KEY-----\n"
   ```

   ### Option 2: Using config.js file
   
   - Create a Personal Access Token on GitHub with appropriate permissions (`workflow` and `repo`)
   - Copy the `config.example.js` file to `config.js`:
     ```
     cp config.example.js config.js
     ```
   - Edit `config.js` and add your token:
     ```javascript
     // In config.js
     const CONFIG = {
       github: {
         owner: 'B11007011',  // Your GitHub username
         repo: 'template',     // Your repository name
         token: 'ghp_your_token_here'  // Your GitHub token
       },
       // ...
     };
     ```

   ### Firebase Configuration (optional)
   
   If you want to track build status with Firebase Firestore:
   
   1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   2. Generate a service account key from Firebase Console > Project Settings > Service Accounts
   3. Copy the `firebase-service-account.example.json` file:
      ```
      cp firebase-service-account.example.json firebase-service-account.json
      ```
   4. Paste your service account JSON data into this file
   
   **IMPORTANT**: Never commit any of these files to the repository!

5. Run the local development server:
   ```
   npm start
   ```

6. Open your browser to http://localhost:3000

## How to Use

### Using the Interface

#### Building Apps

1. Navigate to the "Build New App" tab
2. Fill in the required information:
   - **GitHub Personal Access Token**: Will be pre-filled if configured
   - **Repository Owner**: Will be pre-filled if configured
   - **Repository Name**: Will be pre-filled if configured
   - **App Name**: The name you want for your Android app
   - **Website URL**: The URL to load in the WebView
   - **Build ID** (optional): An ID for tracking the build in Firestore (if configured)

3. Click "Trigger Build" to start the workflow

#### Viewing and Downloading Builds

1. Navigate to the "Previous Builds" tab
2. Enter your GitHub credentials (token, owner, repo name) if not already pre-filled
3. Click "Check Recent Builds"
4. For each successful build, you'll see:
   - Build information (app name, timestamps, etc.)
   - A QR code linking to the APK download
   - A direct download button for the APK

5. Scan the QR code with a mobile device to download the APK directly to your phone

### How the QR Code Downloads Work

The APK download system works in two stages:

1. **API Proxy**: The frontend uses a proxy API (`/api/download`) to:
   - Download the APK from GitHub using your personal access token
   - Extract the APK file from the ZIP archive provided by GitHub
   - Store it temporarily on the server
   - Create a direct download link that doesn't require authentication

2. **QR Code**: The QR code contains a direct download URL to the cached APK file 
   - This URL can be accessed from any device without requiring GitHub authentication
   - When scanned on a mobile device, it allows direct download of the APK

This two-stage process keeps your GitHub token secure while allowing for easy APK installation.

## Security Notes

⚠️ **IMPORTANT**: 

1. The `config.js` and `.env` files contain sensitive information and should NEVER be committed to a repository
2. The server is for local development only and should not be deployed to a public server without adding proper security measures
3. The token storage mechanism used is in-memory only (cleared on server restart) for development purposes
4. For production use, implement proper token management with OAuth or a similar secure method

## Available Interfaces

- **index.html**: Uses the `workflow_dispatch` event (requires `workflow` permission)
- **repository-dispatch.html**: Uses the `repository_dispatch` event (requires `repo` permission)

## Technical Details

### GitHub API Endpoints Used

For workflow_dispatch:
```
POST https://api.github.com/repos/{owner}/{repo}/actions/workflows/build.yaml/dispatches
```

For repository_dispatch:
```
POST https://api.github.com/repos/{owner}/{repo}/dispatches
```

For checking workflow runs:
```
GET https://api.github.com/repos/{owner}/{repo}/actions/runs
```

For getting artifacts:
```
GET https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts
```

For downloading artifacts:
```
GET https://api.github.com/repos/{owner}/{repo}/actions/artifacts/{artifact_id}/zip
```

### Required GitHub Token Permissions

- For workflow_dispatch: The GitHub token needs the `workflow` scope
- For repository_dispatch: The GitHub token needs the `repo` scope
- For downloading artifacts: The GitHub token needs the `repo` scope

## Dependencies

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - For generating QR codes
- [adm-zip](https://github.com/cthackers/adm-zip) - For extracting APK files from GitHub artifact ZIP files
- [firebase-admin](https://www.npmjs.com/package/firebase-admin) - For Firestore integration (optional)
- [dotenv](https://www.npmjs.com/package/dotenv) - For loading environment variables

## File Management

The server manages downloaded files in two directories:
- `downloads/`: Stores extracted APK files ready for download
- `temp/`: Temporarily stores ZIP files during the extraction process

Files older than 24 hours are automatically cleaned up to save disk space.

## Local Storage

The application stores the following data in your browser's local storage:
- Your repository settings (for convenience)
- Recent build history (for quick reference)

No GitHub tokens are stored permanently.

## Customization

You can modify the HTML files to add more fields or change the styling as needed. 

## Firebase Integration

If Firebase is configured, the app will:

1. Track build statuses in Firestore
2. Update build progress in real-time
3. Store build metadata for future reference

The Firestore database structure uses a collection called `builds` with documents identified by the build ID. Each document contains:

- `id`: The build ID
- `status`: Current build status (pending, in_progress, completed, failed)
- `appName`: The name of the application
- `webviewUrl`: The URL loaded in the WebView
- `createdAt`: Timestamp when the build was initiated
- `updatedAt`: Timestamp of the last status update
- `completedAt`: Timestamp when the build completed (if successful)
- `artifactUrl`: URL to the build artifact (if available)
- `owner`: Repository owner
- `repo`: Repository name 