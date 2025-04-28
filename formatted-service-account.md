# Properly Formatted Firebase Service Account for GitHub Actions

## Important Notes:
- Your firebase-service-account-base64.txt file has each line encoded separately
- GitHub Actions requires a single base64 string of the entire JSON file
- Never commit service account credentials to your repository
- Always store them as GitHub secrets

## Steps to create a properly formatted base64 string:

1. **First, decode the existing file to get the original JSON**:
   - Save the lines from firebase-service-account-base64.txt to a file
   - Decode each line and combine them into a proper JSON file

2. **Then, create a properly encoded base64 string**:
   - On Windows:
     ```powershell
     [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Raw service-account.json)))
     ```
   - On Linux/Mac:
     ```bash
     cat service-account.json | base64 -w 0
     ```

3. **Add the resulting string as a GitHub repository secret**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Create a new repository secret named FIREBASE_SERVICE_ACCOUNT_BASE64
   - Paste the base64 string as the value

## Your Firebase Project Details:
- Project ID: trader-35173
- Client Email: firebase-adminsdk-fbsvc@trader-35173.iam.gserviceaccount.com

*These details have been extracted from your provided base64 file and added to your .env file.* 