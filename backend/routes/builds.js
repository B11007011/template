const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { triggerWorkflow } = require('../utils/githubActions');

const db = admin.firestore();
const bucket = admin.storage().bucket();
const buildsCollection = db.collection('builds');

// Mock data for development
const mockBuilds = [
  {
    id: '1683055123456',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 10).toISOString(),
    appName: 'Example Website',
    webviewUrl: 'https://example.com',
    apkUrl: 'https://example.com/builds/app.apk',
    aabUrl: 'https://example.com/builds/app.aab',
    buildPath: 'builds/1683055123456/'
  },
  {
    id: '1683155123456',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    appName: 'Test App',
    webviewUrl: 'https://test.com'
  },
  {
    id: '1683255123456',
    status: 'failed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 3).toISOString(),
    appName: 'Failed App',
    webviewUrl: 'https://fail.com',
    error: 'Failed to build app'
  }
];

// Helper to determine if we should use mock data
const useMockData = () => {
  // Always use mock data if explicitly enabled in .env
  const mockEnabled = process.env.USE_MOCK_DATA === 'true';
  
  // Check if Firebase is initialized properly
  let firebaseInitialized = true;
  try {
    // Try to access Firestore - this will throw if Firebase isn't initialized
    const testDoc = db.collection('_test_').doc('_test_');
    
    // If we've explicitly enabled mock data, log it
    if (mockEnabled) {
      console.log('Using mock data instead of Firebase (explicitly enabled)');
    }
  } catch (error) {
    // Firebase isn't initialized or has an error
    firebaseInitialized = false;
    console.log('Firebase appears to be unavailable, falling back to mock data:', error.message);
  }
  
  // Use mock data if explicitly enabled OR if Firebase is not working
  return mockEnabled || !firebaseInitialized;
};

// Get all builds
router.get('/', async (req, res) => {
  try {
    // Use mock data if enabled
    if (useMockData()) {
      return res.json({
        success: true,
        count: mockBuilds.length,
        data: mockBuilds
      });
    }

    console.log('Attempting to query Firestore collection: builds');
    console.log('Firestore instance:', db._settings);
    
    const snapshot = await buildsCollection.orderBy('completedAt', 'desc').get();
    const builds = [];
    
    snapshot.forEach(doc => {
      builds.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: builds.length,
      data: builds
    });
  } catch (error) {
    console.error('Error fetching builds:', error);
    
    // Add detailed error debugging
    if (error.code) {
      console.error(`Firestore error code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`Firestore error details: ${error.details}`);
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get a specific build by ID
router.get('/:id', async (req, res) => {
  try {
    // Use mock data if enabled
    if (useMockData()) {
      const build = mockBuilds.find(b => b.id === req.params.id);
      if (!build) {
        return res.status(404).json({
          success: false,
          error: 'Build not found'
        });
      }
      return res.json({
        success: true,
        data: build
      });
    }

    const doc = await buildsCollection.doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching build:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Trigger a new build
router.post('/trigger', async (req, res) => {
  try {
    const { appName, webviewUrl } = req.body;
    
    if (!appName || !webviewUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide app name and webview URL'
      });
    }
    
    // Use mock data if enabled
    if (useMockData()) {
      const buildId = Date.now().toString();
      const newBuild = {
        id: buildId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        appName,
        webviewUrl
      };
      
      // Add to mock data
      mockBuilds.unshift(newBuild);
      
      return res.status(201).json({
        success: true,
        data: {
          id: buildId,
          status: 'pending',
          message: 'Build triggered successfully'
        }
      });
    }
    
    // Create a new build document
    const buildId = Date.now().toString();
    await buildsCollection.doc(buildId).set({
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      appName,
      webviewUrl,
      buildId
    });
    
    // Trigger GitHub Actions workflow
    try {
      console.log('Triggering GitHub workflow with parameters:', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN ? '****' + process.env.GITHUB_TOKEN.slice(-4) : 'undefined',
        eventType: 'build-android-request'
      });
      
      await triggerWorkflow({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN,
        eventType: 'build-android-request',
        clientPayload: {
          build_id: buildId,
          app_name: appName,
          url: webviewUrl
        }
      });
      
      console.log(`Build triggered successfully with ID: ${buildId}`);
    } catch (githubError) {
      console.error('Error triggering GitHub workflow:', githubError);
      console.error('GitHub error details:', JSON.stringify(githubError, null, 2));
      
      // Update build status to failed
      await buildsCollection.doc(buildId).update({
        status: 'failed',
        error: 'Failed to trigger build workflow'
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to trigger build workflow'
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: buildId,
        status: 'pending',
        message: 'Build triggered successfully'
      }
    });
  } catch (error) {
    console.error('Error triggering build:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Delete a build
router.delete('/:id', async (req, res) => {
  try {
    const buildId = req.params.id;
    
    // Use mock data if enabled
    if (useMockData()) {
      const buildIndex = mockBuilds.findIndex(b => b.id === buildId);
      if (buildIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Build not found'
        });
      }
      
      // Remove from mock data
      mockBuilds.splice(buildIndex, 1);
      
      return res.json({
        success: true,
        data: {},
        message: 'Build deleted successfully'
      });
    }
    
    const doc = await buildsCollection.doc(buildId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    const buildData = doc.data();
    
    // Delete files from Storage if they exist
    if (buildData.buildPath) {
      try {
        await bucket.deleteFiles({
          prefix: buildData.buildPath
        });
      } catch (storageError) {
        console.error('Error deleting files from storage:', storageError);
      }
    }
    
    // Delete the Firestore document
    await buildsCollection.doc(buildId).delete();
    
    res.json({
      success: true,
      data: {},
      message: 'Build deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 