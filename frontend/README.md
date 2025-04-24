# WebView App Builder

A modern SaaS-like web application that allows users to build Android WebView apps by simply specifying an app name and a URL, without needing to understand the underlying GitHub Actions implementation.

## Features

- Clean, modern UI similar to commercial app building platforms
- Simple two-field interface for creating apps (App Name and Website URL)
- Real-time build status monitoring
- Automatic APK downloads with QR codes for easy mobile installation
- View and download previous builds
- Complete abstraction of GitHub implementation details from end users

## Architecture

The app consists of two main components:

1. **Frontend**: A modern SaaS-like web interface that hides technical implementation details
2. **Backend**: A Node.js server that proxies requests to GitHub Actions

Behind the scenes, the application uses GitHub Actions workflows to build Android WebView apps, but this is completely hidden from the end user.

## Installation and Setup

1. Install Node.js if you don't have it already
2. Navigate to the frontend directory in your terminal
3. Install dependencies:
   ```
   npm install
   ```

4. **Configure the backend** (choose one method):

   ### Option 1: Using .env file (recommended)
   
   Create a `.env` file in the frontend directory with the following content:
   
   ```
   # GitHub Configuration (Hidden from users)
   GITHUB_REPOSITORY=username/repo-name
   GITHUB_TOKEN=your_personal_access_token
   
   # Firebase Configuration (optional)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key goes here\n-----END PRIVATE KEY-----\n"
   ```

   ### Option 2: Using config.js file
   
   - Copy the `config.example.js` file to `config.js`:
     ```
     cp config.example.js config.js
     ```
   - Edit `config.js` and add your GitHub token and repository details
   
   **IMPORTANT**: Never commit any configuration files containing tokens to your repository!

5. Run the local development server:
   ```
   npm start
   ```

6. Open your browser to http://localhost:3000

## User Interface

The application provides a streamlined experience for users:

### Building Apps

1. Enter an App Name
2. Enter the Website URL you want to load in the WebView
3. Click "Build App"
4. Wait for the build to complete (progress is shown automatically)
5. Download the APK directly or scan the QR code with your mobile device

### Viewing Previous Builds

1. Click "View Recent Builds" on the main dashboard
2. Browse through previous builds
3. Download APKs or scan QR codes for any previous successful build

## Technical Details

### Behind the Scenes

The application uses GitHub Actions to build Android apps through a WebView template. When a user requests a build:

1. The frontend sends a request to the server
2. The server uses the configured GitHub token to trigger a GitHub Actions workflow
3. The workflow builds the Android app using Flutter
4. The server periodically checks the build status
5. When complete, the APK is extracted and made available for download
6. A QR code is generated for easy mobile installation

### Security Notes

⚠️ **IMPORTANT**: 

1. The `.env` and `config.js` files contain sensitive information and should NEVER be committed to a repository
2. This server is for local development or internal use only - additional security measures are needed for public deployment
3. The token storage mechanism is in-memory only (cleared on server restart)
4. For production use, implement proper token management with OAuth or a similar secure method

## Customization

You can customize the appearance by modifying:

- `styles.css` - Contains all styling for the application
- `app-builder.html` - The main HTML template
- `images/logo.svg` - The application logo

## Dependencies

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - For generating QR codes
- [adm-zip](https://github.com/cthackers/adm-zip) - For extracting APK files from GitHub artifact ZIP files
- [firebase-admin](https://www.npmjs.com/package/firebase-admin) - For Firestore integration (optional)
- [dotenv](https://www.npmjs.com/package/dotenv) - For loading environment variables 