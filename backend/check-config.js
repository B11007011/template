/**
 * Configuration check script for the backend
 * Run this script with: node check-config.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

// ANSI color codes for terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths to check
const paths = {
  env: path.join(__dirname, '.env'),
  serviceAccount: path.join(__dirname, 'service-account.json')
};

// Required environment variables
const requiredEnvVars = [
  'GITHUB_OWNER',
  'GITHUB_REPO',
  'GITHUB_TOKEN',
  'FIREBASE_STORAGE_BUCKET',
  'PORT'
];

/**
 * Run system checks
 */
async function runChecks() {
  console.log(`${colors.bold}${colors.cyan}=== Backend Configuration Check ===${colors.reset}\n`);
  
  // Check if .env file exists
  const envExists = fs.existsSync(paths.env);
  
  if (envExists) {
    console.log(`${colors.green}✓ .env file found${colors.reset}`);
    
    // Read and check environment variables
    const envContent = fs.readFileSync(paths.env, 'utf8');
    const envLines = envContent.split('\n');
    const missingVars = [];
    
    console.log(`\n${colors.bold}Checking environment variables:${colors.reset}`);
    
    requiredEnvVars.forEach(varName => {
      const varLine = envLines.find(line => 
        line.trim().startsWith(`${varName}=`) && 
        line.trim().length > varName.length + 1
      );
      
      if (varLine) {
        console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${varName} is missing or empty${colors.reset}`);
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      console.log(`\n${colors.yellow}Please add the following variables to your .env file:${colors.reset}`);
      missingVars.forEach(varName => {
        console.log(`${varName}=your_value_here`);
      });
    }
  } else {
    console.log(`${colors.red}✗ .env file not found${colors.reset}`);
    console.log(`${colors.yellow}Creating a sample .env file...${colors.reset}`);
    
    // Create a sample .env file
    const sampleEnv = `# Configuration for the backend server
PORT=5000

# GitHub configuration for triggering builds
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_TOKEN=your-github-token

# Firebase configuration
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Development settings
NODE_ENV=development
`;
    
    fs.writeFileSync(paths.env, sampleEnv);
    console.log(`${colors.green}✓ Sample .env file created${colors.reset}`);
  }
  
  // Check if service-account.json exists
  const serviceAccountExists = fs.existsSync(paths.serviceAccount);
  
  console.log(`\n${colors.bold}Checking Firebase configuration:${colors.reset}`);
  
  if (serviceAccountExists) {
    console.log(`${colors.green}✓ service-account.json file found${colors.reset}`);
    
    // Validate service account file
    try {
      const serviceAccount = require(paths.serviceAccount);
      
      if (serviceAccount.type === 'service_account' && 
          serviceAccount.project_id && 
          serviceAccount.private_key && 
          serviceAccount.client_email) {
        console.log(`${colors.green}✓ Service account format appears valid${colors.reset}`);
        console.log(`${colors.green}✓ Project ID: ${serviceAccount.project_id}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ Service account file has invalid format${colors.reset}`);
        
        if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
          console.log(`${colors.red}  - Missing or invalid 'type' field${colors.reset}`);
        }
        if (!serviceAccount.project_id) {
          console.log(`${colors.red}  - Missing 'project_id' field${colors.reset}`);
        }
        if (!serviceAccount.private_key) {
          console.log(`${colors.red}  - Missing 'private_key' field${colors.reset}`);
        }
        if (!serviceAccount.client_email) {
          console.log(`${colors.red}  - Missing 'client_email' field${colors.reset}`);
        }
      }
    } catch (error) {
      console.log(`${colors.red}✗ Error parsing service-account.json: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ service-account.json file not found${colors.reset}`);
    console.log(`${colors.yellow}You need to create a service account file in Firebase Console:${colors.reset}`);
    console.log(`1. Go to Firebase Console > Project Settings > Service accounts`);
    console.log(`2. Click "Generate new private key"`);
    console.log(`3. Save the file as service-account.json in the backend directory`);
  }
  
  // Check if backend server is running
  console.log(`\n${colors.bold}Checking if backend server is running:${colors.reset}`);
  
  try {
    const isServerRunning = await checkServerRunning();
    
    if (isServerRunning) {
      console.log(`${colors.green}✓ Backend server is running${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Backend server is not running${colors.reset}`);
      console.log(`${colors.yellow}Start the server with:${colors.reset} cd backend && npm run dev`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error checking server: ${error.message}${colors.reset}`);
  }
  
  // Final instructions
  console.log(`\n${colors.bold}${colors.cyan}=== Next Steps ===${colors.reset}`);
  
  if (!serviceAccountExists) {
    console.log(`${colors.bold}1. Create a Firebase service account file${colors.reset}`);
  }
  
  if (envExists && missingVars && missingVars.length > 0) {
    console.log(`${colors.bold}${serviceAccountExists ? '1' : '2'}. Complete the missing environment variables in .env${colors.reset}`);
  }
  
  console.log(`${colors.bold}${serviceAccountExists ? (missingVars && missingVars.length > 0 ? '2' : '1') : '3'}. Start the backend server:${colors.reset} npm run dev`);
  console.log(`${colors.bold}${serviceAccountExists ? (missingVars && missingVars.length > 0 ? '3' : '2') : '4'}. Check the frontend API connection in the dashboard${colors.reset}`);
  
  rl.close();
}

/**
 * Check if the backend server is running
 */
function checkServerRunning() {
  return new Promise((resolve) => {
    // Use different commands based on platform
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr "LISTENING" | findstr "5000"`
      : `lsof -i :5000`;
    
    exec(command, (error, stdout) => {
      if (error) {
        // Command failed, assume server is not running
        resolve(false);
        return;
      }
      
      // If output contains data, server is likely running
      resolve(stdout.trim().length > 0);
    });
  });
}

// Start checks
runChecks(); 