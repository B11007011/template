# Backend Configuration Guide

This guide will help you set up the backend server correctly to make the builds system work.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Firebase Setup](#firebase-setup)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Starting the Backend Server](#starting-the-backend-server)
- [Checking the Connection](#checking-the-connection)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:
- Node.js installed (version 14 or higher)
- npm or yarn package manager
- A Firebase project with Firestore and Storage enabled
- (Optional) A GitHub account for CI/CD integration

## Running Configuration Check

We've created a utility script to help diagnose configuration issues:

```bash
cd backend
node check-config.js
```

Follow the instructions provided by the script to fix any identified issues.

## Firebase Setup

1. **Create a Firebase project (if you don't have one):**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps

2. **Enable Firestore and Storage:**
   - In Firebase Console, navigate to "Firestore Database" 
   - Click "Create database"
   - Choose either production or test mode (test mode is fine for development)
   - Select a region close to your users
   - Repeat similar steps for Storage from the left sidebar

3. **Generate a service account key:**
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account.json` in the `backend` directory

This service account file allows the backend to authenticate with Firebase.

## Environment Variables Configuration

Create a `.env` file in the `backend` directory with the following variables:

```
# Server configuration
PORT=5000
NODE_ENV=development

# Firebase configuration
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# GitHub configuration (optional, for CI/CD builds)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_TOKEN=your-github-token
```

### Notes:
- `FIREBASE_STORAGE_BUCKET`: Find this in Firebase Console > Storage. Usually it's `your-project-id.appspot.com`
- The GitHub variables are only needed if you're using GitHub Actions for CI/CD builds.

## Starting the Backend Server

Once everything is configured, start the backend server:

```bash
cd backend
npm install  # Only needed first time
npm run dev
```

The server should start on port 5000 (or the port you specified in `.env`).

## Checking the Connection

1. Make sure both the frontend and backend are running:
   ```bash
   # Terminal 1 (Backend)
   cd backend
   npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

2. Open your browser and navigate to the build download page:
   ```
   http://localhost:3000/account/dashboard/build-download
   ```

3. If you see an error, click on "API Connection Troubleshooting" and use the debugging tools.

4. If the API connection test passes but no builds are showing:
   - You might not have any builds yet
   - Try creating a new build by clicking "New Build"
   - Check that you're properly authenticated (signed in)

## Troubleshooting

### API Connection Errors

If the API is not connecting:

1. **Check if backend is running:** Verify the backend server is running on port 5000
2. **CORS issues:** Make sure the backend CORS configuration includes your frontend origin
3. **Environment variables:** Confirm NEXT_PUBLIC_API_URL is set correctly in the frontend's .env.local

### Firebase Errors

If Firebase is not working:

1. **Service account:** Verify service-account.json exists and has the correct format
2. **Permissions:** Ensure the service account has the necessary permissions
3. **Firestore setup:** Confirm Firestore is enabled in your Firebase project

### Authentication Issues

If authentication is not working:

1. **Firebase config:** Check that Firebase authentication settings are properly configured
2. **API URL:** Make sure the API URL is set correctly in both frontend and backend
3. **Login state:** Confirm you're properly logged in to the dashboard

## Using Mock Data for Testing

If you're having trouble setting up Firebase but want to test the system:

1. Edit the `backend/routes/builds.js` file
2. Find the `useMockData` function and change it to return `true` instead of `false`
3. Restart the backend server

This will make the system use mock data instead of trying to connect to Firebase. 