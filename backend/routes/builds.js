const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { triggerWorkflow } = require('../utils/githubActions');

const db = admin.firestore();
const bucket = admin.storage().bucket();
const buildsCollection = db.collection('builds');

// Get all builds
router.get('/', async (req, res) => {
  try {
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
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get a specific build by ID
router.get('/:id', async (req, res) => {
  try {
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