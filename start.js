/**
 * Development startup script for the project
 * This script starts both the frontend and backend in development mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Check if backend configuration exists
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const serviceAccountPath = path.join(__dirname, 'backend', 'service-account.json');

// Function to run a command in a specific directory
function runCommand(command, args, cwd, name) {
  const color = name === 'frontend' ? colors.magenta : colors.cyan;
  
  console.log(`${color}Starting ${name}...${colors.reset}`);
  
  const childProcess = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: true }
  });
  
  // Set up stdout handling
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`${color}[${name}] ${colors.reset}${line}`);
    });
  });
  
  // Set up stderr handling
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      // Filter out some noisy webpack messages
      if (line.includes('compiled successfully') || 
          line.includes('compiled with warnings') ||
          line.includes('Module not found')) {
        console.log(`${color}[${name}] ${colors.reset}${line}`);
      } else {
        console.error(`${color}[${name}] ${colors.red}${line}${colors.reset}`);
      }
    });
  });
  
  // Handle process exit
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`${color}[${name}] ${colors.red}Process exited with code ${code}${colors.reset}`);
    } else {
      console.log(`${color}[${name}] Process exited${colors.reset}`);
    }
  });
  
  return childProcess;
}

// Check configuration before starting
console.log(`${colors.bold}Checking configuration...${colors.reset}`);

let backendConfigOk = true;

if (!fs.existsSync(backendEnvPath)) {
  console.log(`${colors.yellow}Backend .env file not found at ${backendEnvPath}${colors.reset}`);
  backendConfigOk = false;
}

if (!fs.existsSync(serviceAccountPath)) {
  console.log(`${colors.yellow}Firebase service account not found at ${serviceAccountPath}${colors.reset}`);
  backendConfigOk = false;
}

if (!backendConfigOk) {
  console.log(`${colors.yellow}Running backend with mock data mode...${colors.reset}`);
  // Create a temporary .env file with mock data enabled
  fs.writeFileSync(
    backendEnvPath,
    `PORT=5000\nUSE_MOCK_DATA=true\nNODE_ENV=development\n`,
    { flag: 'a+' }
  );
  console.log(`${colors.green}Created/updated .env file with mock data enabled${colors.reset}`);
}

console.log(`${colors.bold}Starting development servers...${colors.reset}`);

// Start backend
const backendProcess = runCommand(
  'npm', 
  ['run', 'dev'], 
  path.join(__dirname, 'backend'),
  'backend'
);

// Start frontend (after a slight delay to let backend initialize)
setTimeout(() => {
  const frontendProcess = runCommand(
    'npm', 
    ['run', 'dev'],
    path.join(__dirname, 'frontend'), 
    'frontend'
  );
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(`\n${colors.bold}Shutting down servers...${colors.reset}`);
    frontendProcess.kill();
    backendProcess.kill();
    process.exit();
  });
}, 2000);

console.log(`${colors.green}${colors.bold}
=================================================
🚀 Development servers starting up...
=================================================
${colors.reset}

${colors.cyan}Backend:${colors.reset} http://localhost:5000/api
${colors.magenta}Frontend:${colors.reset} http://localhost:3000

${colors.yellow}To view the builds page, go to:${colors.reset}
http://localhost:3000/account/dashboard/build-download

${colors.bold}Press Ctrl+C to stop both servers${colors.reset}
`); 