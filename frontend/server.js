const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createWriteStream, createReadStream } = require('fs');
const { pipeline } = require('stream/promises');
const AdmZip = require('adm-zip');
const admin = require('firebase-admin');

// Load environment variables from .env file
require('dotenv').config();

// Try to load configuration
let config = { github: { token: '', owner: '', repo: '' }, firebase: null };
try {
  const configPath = path.join(__dirname, 'config.js');
  if (fs.existsSync(configPath)) {
    config = require('./config.js');
    console.log('Configuration loaded from config.js');
  } else {
    // If no config.js exists, try to use environment variables
    const repoSplit = (process.env.GITHUB_REPOSITORY || '').split('/');
    config.github.token = process.env.GITHUB_TOKEN || '';
    config.github.owner = repoSplit[0] || '';
    config.github.repo = repoSplit[1] || '';
    
    // Setup Firebase config from env variables if available
    if (process.env.FIREBASE_PROJECT_ID) {
      config.firebase = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };
    }
    
    console.log('No config.js found, using environment variables');
  }
} catch (error) {
  console.warn('Error loading configuration:', error.message);
  
  // Fallback to environment variables
  const repoSplit = (process.env.GITHUB_REPOSITORY || '').split('/');
  config.github.token = process.env.GITHUB_TOKEN || '';
  config.github.owner = repoSplit[0] || '';
  config.github.repo = repoSplit[1] || '';
  
  // Setup Firebase config from env variables
  if (process.env.FIREBASE_PROJECT_ID) {
    config.firebase = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
  }
}

// Create a simple token storage mechanism
const tokenStorage = {
  // In-memory token cache (cleared on server restart)
  tokens: new Map(),
  
  // Store a token by ID
  storeToken: function(id, token) {
    this.tokens.set(id, token);
    return id;
  },
  
  // Get a token by ID
  getToken: function(id) {
    return this.tokens.get(id);
  },
  
  // Generate a token ID (simple random string)
  generateTokenId: function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  // Default token from config (if available)
  defaultToken: config.github.token || ''
};

// Initialize Firebase Admin if config exists
let firebaseAdmin = null;
let firestoreDb = null;

if (config.firebase && config.firebase.serviceAccount) {
  try {
    // Initialize Firebase with service account credentials
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(config.firebase.serviceAccount),
      databaseURL: config.firebase.databaseURL
    });
    
    firestoreDb = firebaseAdmin.firestore();
    console.log('Firebase Admin SDK initialized with service account');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin with service account:', error);
  }
} else if (config.firebase && config.firebase.projectId) {
  try {
    // Initialize Firebase with environment variables
    const serviceAccount = {
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey
    };
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    firestoreDb = firebaseAdmin.firestore();
    console.log('Firebase Admin SDK initialized with environment variables');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin with environment variables:', error);
  }
}

const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const TEMP_DIR = path.join(__dirname, 'temp');

// Create download and temp directories if they don't exist
for (const dir of [DOWNLOAD_DIR, TEMP_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
  '.apk': 'application/vnd.android.package-archive',
  '.zip': 'application/zip'
};

// Security headers to protect against common web vulnerabilities
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src https://api.github.com",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' // For when deployed with HTTPS
};

// Helper function to download files from GitHub and extract APK
async function downloadFromGitHub(token, artifact_url, filename) {
  try {
    // Create a temporary zip file path
    const tempZipPath = path.join(TEMP_DIR, `temp-${Date.now()}.zip`);
    const outputPath = path.join(DOWNLOAD_DIR, filename);
    
    // Download the zip file from GitHub
    const response = await new Promise((resolve, reject) => {
  const options = {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'WebView-App-Builder'
    }
  };

      https.get(artifact_url, options, resolve).on('error', reject);
    });
  
    if (response.statusCode !== 200) {
      throw new Error(`Failed to download: ${response.statusCode}`);
    }
    
    // Save the zip file
    const fileStream = createWriteStream(tempZipPath);
    await pipeline(response, fileStream);
    
    // Extract APK file from the zip
    try {
      const zip = new AdmZip(tempZipPath);
      const zipEntries = zip.getEntries();
      
      // Find the APK file
      const apkEntry = zipEntries.find(entry => entry.entryName.endsWith('.apk'));
      
      if (!apkEntry) {
        throw new Error('No APK file found in the downloaded archive');
      }
      
      // Extract the APK to our downloads directory with the specified filename
      zip.extractEntryTo(apkEntry, DOWNLOAD_DIR, false, true, false, filename);
      
      // Verify the file was extracted
      if (!fs.existsSync(outputPath)) {
        // If extraction with rename didn't work, extract and then rename
        const extractedPath = path.join(DOWNLOAD_DIR, apkEntry.entryName);
        zip.extractEntryTo(apkEntry, DOWNLOAD_DIR, false, true);
        
        if (fs.existsSync(extractedPath)) {
          fs.renameSync(extractedPath, outputPath);
        } else {
          throw new Error('Failed to extract APK file');
        }
      }
      
      // Clean up the temporary zip file
      fs.unlinkSync(tempZipPath);
      
      return filename;
    } catch (error) {
      console.error('Error extracting APK:', error);
      
      // If extraction fails, just rename the zip file to the requested filename
      fs.renameSync(tempZipPath, outputPath);
      return filename;
    }
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

// Clean up old downloads (files older than 24 hours)
function cleanupDownloads() {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  for (const dir of [DOWNLOAD_DIR, TEMP_DIR]) {
    fs.readdir(dir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > ONE_DAY) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
  }
}

// Run cleanup every hour
setInterval(cleanupDownloads, 60 * 60 * 1000);
// Also clean up on server start
cleanupDownloads();

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers for API endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
  }
  
  // API endpoint for GitHub Actions to update build status
  if (pathname === '/api/update-build-status' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse the request body
        const data = JSON.parse(body);
        const { build_id, status, app_name, webview_url, artifact_url, error } = data;
        
        if (!build_id || !status) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing required parameters' }));
          return;
        }
        
        // Check for secret key if defined in config
        if (config.buildUpdateKey && data.key !== config.buildUpdateKey) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid authentication key' }));
          return;
        }
        
        // Update build status in Firestore
        if (firestoreDb) {
          try {
            const buildRef = firestoreDb.collection('builds').doc(build_id);
            
            // Create payload with update timestamp
            const updateData = {
              status: status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            // Add optional fields if provided
            if (app_name) updateData.appName = app_name;
            if (webview_url) updateData.webviewUrl = webview_url;
            
            if (status === 'completed' && artifact_url) {
              updateData.artifactUrl = artifact_url;
              updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
            }
            
            if (status === 'failed' && error) {
              updateData.error = error;
            }
            
            // Perform the update
            await buildRef.set(updateData, { merge: true });
            
            console.log(`Updated build ${build_id} status to ${status}`);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: `Build status updated to ${status}` 
            }));
          } catch (error) {
            console.error('Error updating Firestore:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to update build status in Firestore' }));
          }
        } else {
          // Firebase not initialized, return success but log this
          console.warn('Firebase not initialized, build status not saved');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Request received but Firebase not available',
            warning: 'Firebase not initialized, status not persisted'
          }));
        }
      } catch (error) {
        console.error('Error parsing request:', error);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid request format' }));
      }
    });
    
    return;
  }
  
  // API endpoint to query build status
  if (pathname === '/api/build-status') {
    const { build_id } = parsedUrl.query;
    
    if (!build_id) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing build_id parameter' }));
      return;
    }
    
    if (firestoreDb) {
      try {
        const buildRef = firestoreDb.collection('builds').doc(build_id);
        const doc = await buildRef.get();
        
        if (doc.exists) {
          const buildData = doc.data();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: true, 
            build: buildData
          }));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Build not found'
          }));
        }
      } catch (error) {
        console.error('Error querying Firestore:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to query build status' }));
      }
    } else {
      // Firebase not initialized
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Firebase not available'
      }));
    }
    return;
  }
  
  // API endpoint to get the default token ID
  if (pathname === '/api/default-token') {
    // Only return a token if we have one configured
    if (tokenStorage.defaultToken) {
      // Store the token and return the ID
      const tokenId = tokenStorage.generateTokenId();
      tokenStorage.storeToken(tokenId, tokenStorage.defaultToken);
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        tokenId: tokenId,
        owner: config.github.owner || '',
        repo: config.github.repo || ''
      }));
    } else {
      // No default token available
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'No default token configured',
        owner: config.github.owner || '',
        repo: config.github.repo || ''
      }));
    }
    return;
  }
  
  // API endpoint to use a token by ID for downloads
  if (pathname.startsWith('/api/token-download')) {
    const { tokenId, artifact_url, filename } = parsedUrl.query;
    
    if (!tokenId || !artifact_url) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required parameters' }));
      return;
    }
    
    // Get the token from storage
    const token = tokenStorage.getToken(tokenId);
    if (!token) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid or expired token ID' }));
      return;
    }
    
    // Now proceed with the download using the retrieved token
    const safeFilename = path.basename(filename || 'app.apk').replace(/[^a-zA-Z0-9._-]/g, '_');
    const localFilePath = path.join(DOWNLOAD_DIR, safeFilename);
    
    // Check if file already exists
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      const fileAge = Date.now() - stats.mtime.getTime();
      
      // If file is newer than 1 hour, use cached version
      if (fileAge < 60 * 60 * 1000) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          success: true, 
          message: 'File already cached',
          download_url: `/download/${safeFilename}`
        }));
        return;
      }
    }
    
    // Download and process the file
    try {
      const savedFilename = await downloadFromGitHub(token, artifact_url, safeFilename);
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        download_url: `/download/${savedFilename}`
      }));
    } catch (error) {
      console.error('Download error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to download file: ' + error.message }));
    }
    
    return;
  }
  
  // Handle API requests for proxying GitHub downloads
  if (pathname.startsWith('/api/download')) {
    // Expected format: /api/download?token=XXX&artifact_url=XXX&filename=XXX
    const { token, artifact_url, filename } = parsedUrl.query;
    
    if (!token || !artifact_url) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required parameters' }));
      return;
    }
    
    const safeFilename = path.basename(filename || 'app.apk').replace(/[^a-zA-Z0-9._-]/g, '_');
    const localFilePath = path.join(DOWNLOAD_DIR, safeFilename);
    
    // Check if file already exists
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      const fileAge = Date.now() - stats.mtime.getTime();
      
      // If file is newer than 1 hour, use cached version
      if (fileAge < 60 * 60 * 1000) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          success: true, 
          message: 'File already cached',
          download_url: `/download/${safeFilename}`
        }));
        return;
      }
    }
    
    // Download and process the file
    try {
      const savedFilename = await downloadFromGitHub(token, artifact_url, safeFilename);
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        download_url: `/download/${savedFilename}`
      }));
    } catch (error) {
      console.error('Download error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to download file: ' + error.message }));
    }
    
    return;
  }
  
  // API endpoint to proxy GitHub API requests with a token ID
  if (pathname.startsWith('/api/github-proxy/')) {
    const { tokenId, owner, repo } = parsedUrl.query;
    
    if (!tokenId || !owner || !repo) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required parameters' }));
      return;
    }
    
    // Get the token from storage
    const token = tokenStorage.getToken(tokenId);
    if (!token) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid or expired token ID' }));
      return;
    }
    
    // The GitHub API path is everything after /api/github-proxy/
    const githubPath = pathname.substring('/api/github-proxy/'.length);
    
    // Forward the request to GitHub API
    try {
      const githubUrl = `https://api.github.com/repos/${owner}/${repo}/${githubPath}`;
      const githubResponse = await new Promise((resolve, reject) => {
        const options = {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'WebView-App-Builder'
          }
        };
        
        https.get(githubUrl, options, resolve).on('error', reject);
      });
      
      // Set the same status code as GitHub
      res.statusCode = githubResponse.statusCode;
      
      // Forward the response headers
      Object.keys(githubResponse.headers).forEach(key => {
        res.setHeader(key, githubResponse.headers[key]);
      });
      
      // Pipe the response data
      githubResponse.pipe(res);
    } catch (error) {
      console.error('GitHub proxy error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'GitHub API proxy error: ' + error.message }));
    }
    
    return;
  }
  
  // Handle direct downloads
  if (pathname.startsWith('/download/')) {
    const filename = path.basename(pathname.substring('/download/'.length));
    const filePath = path.join(DOWNLOAD_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Set headers for download
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    return;
  }

  // For normal static files
  let filePath = parsedUrl.pathname;
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Get the full path to the requested file
  const fullPath = path.join(__dirname, filePath);
  
  // Get file extension to determine content type
  const ext = path.extname(fullPath).toLowerCase();
  
  // Check if the file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    // Read and serve the file
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('500 Internal Server Error');
        return;
      }

      // Set the content type based on file extension
      const contentType = MIME_TYPES[ext] || 'text/plain';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      
      // Add security headers for HTML/JS/CSS content
      if (['.html', '.js', '.css'].includes(ext)) {
        Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
          res.setHeader(header, value);
        });
      }
      
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`WebView App Builder server is running at http://localhost:${PORT}/`);
  console.log(`Main interface: http://localhost:${PORT}/`);
  console.log(`Alternative interface: http://localhost:${PORT}/repository-dispatch.html`);
  console.log(`\nIMPORTANT: This server is for local development only. Never deploy`);
  console.log(`          this application to a public server without proper security measures.`);
}); 