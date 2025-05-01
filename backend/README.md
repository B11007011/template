# App Builder Backend

Backend service for WebView App Builder.

## Deployment to Render

### Automatic Deployment

This repository is configured to deploy automatically to Render using the `render.yaml` configuration file.

1. Create a new Render account if you don't have one at https://render.com
2. Create a new "Blueprint" instance
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up the service

### Manual Deployment

If you prefer manual deployment:

1. Create a new "Web Service" on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Choose an appropriate plan (start with free)

4. Set up the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render requires this internally)
   - `GITHUB_OWNER`: Your GitHub username
   - `GITHUB_REPO`: Your repository name
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket URL
   - `USE_MOCK_DATA`: `false`

5. Deploy your service

### Service Account File

Your application requires a `service-account.json` file for Firebase authentication. You have two options:

1. **Option 1**: Add the file to your repository (not recommended for security reasons)
2. **Option 2**: Set up a file override in Render:
   - Go to your service settings in Render
   - Navigate to "File Overrides"
   - Create a new file override:
     - **Path**: `/opt/render/project/src/service-account.json`
     - **Contents**: Paste the contents of your Firebase service account JSON file

## Important Notes

- The free tier of Render will spin down after periods of inactivity. The first request after inactivity may take a few seconds.
- Make sure to properly secure your GitHub token and Firebase service account details.
- Update your CORS settings in `index.js` if your frontend is hosted on a different domain. 