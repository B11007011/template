require('dotenv').config();
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
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
  });
  
  console.log('Firebase initialized successfully with bucket:', 
    process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/builds', require('./routes/builds'));

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