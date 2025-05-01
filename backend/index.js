require('dotenv').config();

// Force the use of real data regardless of configuration
process.env.USE_MOCK_DATA = 'false';
console.log('Forcing real data mode: USE_MOCK_DATA set to false');

// Debug environment variables loading
console.log('Environment variables loaded:');
console.log('GITHUB_OWNER:', process.env.GITHUB_OWNER || 'undefined');
console.log('GITHUB_REPO:', process.env.GITHUB_REPO || 'undefined');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? `****${process.env.GITHUB_TOKEN.slice(-4)}` : 'undefined');
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Check if running in production or development
const isProduction = process.env.NODE_ENV === 'production';

// Load service account from file
const serviceAccountPath = path.join(__dirname, 'service-account.json');
console.log(`Looking for service account at: ${serviceAccountPath}`);

// Initialize Firebase with service account
try {
  // Check if service account file exists
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account file not found at:', serviceAccountPath);
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);
  console.log('Service account loaded successfully with project_id:', serviceAccount.project_id);
  console.log('Service account client_email:', serviceAccount.client_email);
  console.log('Service account private_key is defined:', !!serviceAccount.private_key);
  
  // Test connection to Firestore before initializing the app
  console.log('Testing Firebase credentials...');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
    projectId: serviceAccount.project_id,
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  
  console.log('Firebase initialized successfully with:');
  console.log('- projectId:', serviceAccount.project_id);
  console.log('- bucket:', process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`);
  console.log('- databaseURL:', `https://${serviceAccount.project_id}.firebaseio.com`);
  
  // Test Firestore connection
  const testDb = admin.firestore();
  testDb.collection('_test_').doc('_test_').get()
    .then(() => {
      console.log('Successfully connected to Firestore!');
    })
    .catch(error => {
      console.error('Firestore connection test failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.code === 'permission-denied') {
        console.error('This is a permissions issue - the service account lacks proper permissions.');
        console.error('Please verify the service account has the "Firebase Admin SDK Administrator Service Agent" role.');
      } else if (error.code === 'resource-exhausted') {
        console.error('This is a quota issue - the project may have billing disabled or quotas exceeded.');
      } else if (error.code === 'project-deleted' || error.code === 'project-disabled') {
        console.error('The project has been deleted or disabled in Firebase Console.');
      } else if (error.code === 'unauthenticated') {
        console.error('This is an authentication issue - the service account key may be revoked or invalid.');
        console.error('Try generating a new service account key in Firebase Console.');
      }
      
      // We'll log the error but continue with mock data
      console.log('Continuing with mock data enabled...');
    });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  if (error.code === 'app/duplicate-app') {
    console.error('Firebase app already exists, this is likely a code issue.');
  } else if (error.code === 'app/invalid-credential') {
    console.error('Invalid credentials, check service account format and validity.');
  } else if (error.code === 'app/invalid-app-options') {
    console.error('Invalid app options, check project ID and other configuration.');
  } else {
    console.error('Generic error, check the service account file format and content.');
  }
  
  console.error('Full error details:', JSON.stringify(error, null, 2));
  console.log('Warning: Firebase initialization had issues but will attempt to use real data anyway');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  // Enhanced logging for all requests
  console.log(`
====== INCOMING REQUEST ======
Method: ${req.method}
URL: ${req.url}
Path: ${req.path}
Params: ${JSON.stringify(req.params)}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body)}
=============================
  `);
  next();
});

// Routes
app.use('/api/builds', require('./routes/builds'));

// Simple debug route to test API connectivity
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    env: process.env.NODE_ENV,
    mockData: process.env.USE_MOCK_DATA === 'true'
  });
});

// Firebase debug route to test Firebase connection
app.get('/api/debug/firebase', (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(500).json({
        success: false,
        error: 'Firebase not initialized',
        message: 'Firebase Admin SDK is not initialized. Check service-account.json'
      });
    }
    
    // Test Firestore connection
    const db = admin.firestore();
    db.collection('_test_').doc('_test_').get()
      .then(() => {
        return res.json({
          success: true, 
          message: 'Firebase connection is working correctly',
          firestore: true,
          storage: !!admin.storage().bucket()
        });
      })
      .catch(error => {
        console.error('Firestore test failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Firestore connection failed',
          errorCode: error.code,
          errorMessage: error.message,
          message: 'Firebase Firestore connection test failed'
        });
      });
  } catch (error) {
    console.error('Firebase debug route error:', error);
    return res.status(500).json({
      success: false,
      error: 'Firebase test error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: isProduction ? 'Server Error' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 