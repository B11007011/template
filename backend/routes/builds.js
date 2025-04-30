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
  // Set this to true to force using mock data with our Firebase Storage build
  const forceMock = true;
  if (forceMock) {
    console.log('Using mock data (forced via code)');
    return true;
  }
  
  // If environment variable is explicitly set, respect that
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data (environment variable set)');
    return true;
  }
  
  // If no Firebase configuration, use mock data
  if (!admin.apps.length) {
    console.log('Using mock data (Firebase not initialized)');
    return true;
  }
  
  // If mock data is explicitly disabled
  if (process.env.USE_MOCK_DATA === 'false') {
    console.log('Using real Firebase data (environment variable set)');
    return false;
  }
  
  // Check service account presence by trying to get Firestore settings
  try {
    const settings = db._settings;
    if (!settings || !settings.projectId) {
      console.log('Using mock data (invalid Firestore settings)');
      return true;
    }
  } catch (error) {
    console.log('Using mock data (error checking Firestore settings):', error);
    return true;
  }
  
  // Default to real data if nothing above triggered
  console.log('Using real Firebase data (default)');
  return false;
};

// Get all builds
router.get('/', async (req, res) => {
  try {
    // Check if we should use mock data
    if (useMockData()) {
      console.log('Returning mock build data');
      
      // Add our static completed build for the real Firebase Storage files
      const staticBuild = {
        id: '14709933897',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        appName: 'Tecxmate',
        webviewUrl: 'https://tw.tecxmate.com/en',
        apkUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.apk`,
        aabUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.aab`,
        buildPath: `builds/14709933897`
      };
      
      // Add the static build to the beginning of the mock builds array
      const enhancedMockBuilds = [staticBuild, ...mockBuilds];
      
      return res.json({
        success: true,
        count: enhancedMockBuilds.length,
        data: enhancedMockBuilds,
        isMock: true
      });
    }
    
    console.log('Attempting to query Firestore collection: builds');
    console.log('Firestore instance:', db._settings ? `projectId: ${db._settings.projectId}` : 'settings not available');
    
    try {
      const snapshot = await buildsCollection.orderBy('createdAt', 'desc').get();
      const builds = [];
      
      snapshot.forEach(doc => {
        builds.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Check if we need to add the static build reference
      const hasBuild14709933897 = builds.some(build => build.id === '14709933897');
      
      if (!hasBuild14709933897) {
        // Add a reference to the static build that exists in Firebase Storage
        const staticBuild = {
          id: '14709933897',
          status: 'completed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
          appName: 'Tecxmate',
          webviewUrl: 'https://tw.tecxmate.com/en',
          apkUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.apk`,
          aabUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.aab`,
          buildPath: `builds/14709933897`
        };
        
        // Add it to the beginning of the builds array
        builds.unshift(staticBuild);
      }
      
      console.log(`Successfully retrieved ${builds.length} builds from Firestore`);
      
      res.json({
        success: true,
        count: builds.length,
        data: builds
      });
    } catch (firestoreError) {
      console.error('Firestore query error:', firestoreError);
      
      // Add detailed error debugging
      if (firestoreError.code) {
        console.error(`Firestore error code: ${firestoreError.code}`);
      }
      
      if (firestoreError.details) {
        console.error(`Firestore error details: ${firestoreError.details}`);
      }
      
      // Fall back to mock data if Firestore query fails, including our static build
      console.log('Falling back to mock data due to Firestore error');
      
      // Add our static completed build for the real Firebase Storage files
      const staticBuild = {
        id: '14709933897',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        appName: 'Tecxmate',
        webviewUrl: 'https://tw.tecxmate.com/en',
        apkUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.apk`,
        aabUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/14709933897/app.aab`,
        buildPath: `builds/14709933897`
      };
      
      // Add the static build to the beginning of the mock builds array
      const enhancedMockBuilds = [staticBuild, ...mockBuilds];
      
      return res.json({
        success: true,
        count: enhancedMockBuilds.length,
        data: enhancedMockBuilds,
        isMock: true,
        error: `Firestore error: ${firestoreError.message || firestoreError.code || 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('Error fetching builds:', error);
    
    // Add detailed error debugging
    if (error.code) {
      console.error(`Firestore error code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`Firestore error details: ${error.details}`);
    }
    
    // Try to return mock data even on error
    try {
      console.log('Attempting to return mock data due to server error');
      return res.json({
        success: true,
        count: mockBuilds.length,
        data: mockBuilds,
        isMock: true,
        error: `Server error: ${error.message || 'Unknown error'}`
      });
    } catch (mockError) {
      // If even returning mock data fails, return a standard error
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error.message || 'Unknown server error'
      });
    }
  }
});

// Get a specific build by ID
router.get('/:id', async (req, res) => {
  try {
    const buildId = req.params.id;
    
    // Check if using mock data
    if (useMockData()) {
      // For testing - look for a specific build ID pattern to show a complete build
      if (buildId === '14709933897') {
        return res.json({
          success: true,
          data: {
            id: buildId,
            status: 'completed',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            completedAt: new Date().toISOString(),
            appName: 'Tecxmate',
            webviewUrl: 'https://tw.tecxmate.com/en',
            apkUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.apk`,
            aabUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.aab`,
            buildPath: `builds/${buildId}`
          },
          isMock: true
        });
      }
      
      // Look for a matching build in mock data
      const mockBuild = mockBuilds.find(build => build.id === buildId);
      
      if (!mockBuild) {
        return res.status(404).json({
          success: false,
          error: 'Build not found'
        });
      }
      
      return res.json({
        success: true,
        data: mockBuild,
        isMock: true
      });
    }
    
    // Real Firebase implementation
    const doc = await buildsCollection.doc(buildId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    const buildData = {
      id: doc.id,
      ...doc.data()
    };
    
    // If the build is pending, check if the files exist in Firebase Storage
    if (buildData.status === 'pending') {
      try {
        // Check if the build folder and files exist in Storage
        const buildPath = `builds/${buildId}`;
        const apkFile = bucket.file(`${buildPath}/app.apk`);
        const aabFile = bucket.file(`${buildPath}/app.aab`);
        
        // Check if both files exist
        const [apkExists] = await apkFile.exists();
        const [aabExists] = await aabFile.exists();
        
        console.log(`Checking build files for ${buildId}: APK exists: ${apkExists}, AAB exists: ${aabExists}`);
        
        if (apkExists && aabExists) {
          console.log(`Found completed build files for ${buildId}, updating status to completed`);
          
          // Generate signed URLs for the files
          const apkUrl = `https://storage.googleapis.com/${bucket.name}/${buildPath}/app.apk`;
          const aabUrl = `https://storage.googleapis.com/${bucket.name}/${buildPath}/app.aab`;
          
          // Update the build in Firestore
          await buildsCollection.doc(buildId).update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            apkUrl,
            aabUrl,
            buildPath
          });
          
          // Update the response data
          buildData.status = 'completed';
          buildData.completedAt = new Date().toISOString();
          buildData.apkUrl = apkUrl;
          buildData.aabUrl = aabUrl;
          buildData.buildPath = buildPath;
        }
      } catch (storageError) {
        console.error(`Error checking storage for build files for ${buildId}:`, storageError);
        // Continue with current build data
      }
    }
    
    res.json({
      success: true,
      data: buildData
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
    
    // Validate and sanitize the URL
    let validUrl = webviewUrl;
    try {
      // Add protocol if missing
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      // Check if it's a valid URL
      new URL(validUrl); // This will throw if invalid
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL provided. Please enter a valid website URL.'
      });
    }
    
    // Create a new build document
    const buildId = Date.now().toString();
    
    // Create a Firestore document for the build
    await buildsCollection.doc(buildId).set({
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      appName,
      webviewUrl: validUrl,
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
          url: validUrl
        }
      });
      
      console.log(`Build triggered successfully with ID: ${buildId}`);
    } catch (githubError) {
      console.error('Error triggering GitHub workflow:', githubError);
      console.error('GitHub error details:', JSON.stringify(githubError, null, 2));
      
      // Update build status to failed
      await buildsCollection.doc(buildId).update({
        status: 'failed',
        error: 'Failed to trigger build workflow',
        errorDetails: githubError.message
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to trigger build workflow',
        message: githubError.message
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

// Download a build
router.get('/:id/download', async (req, res) => {
  try {
    const buildId = req.params.id;
    
    // For our static Firebase Storage build, redirect directly to the file
    if (buildId === '14709933897') {
      // Determine the file type from the query parameter (apk or aab)
      const fileType = req.query.type || 'apk';
      
      if (fileType === 'apk') {
        return res.redirect(`https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.apk`);
      } else if (fileType === 'aab') {
        return res.redirect(`https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.aab`);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Use type=apk or type=aab'
        });
      }
    }
    
    // For mock builds, return a success message
    if (useMockData()) {
      return res.json({
        success: true,
        message: 'Mock download initiated',
        downloadUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${buildId}/app.apk`
      });
    }
    
    // Get build data from Firestore
    const doc = await buildsCollection.doc(buildId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    const buildData = doc.data();
    
    // Check if build is completed
    if (buildData.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Build is not completed yet'
      });
    }
    
    // Check if buildPath exists
    if (!buildData.buildPath) {
      return res.status(400).json({
        success: false,
        error: 'Build files not found'
      });
    }
    
    try {
      // Determine the file type from the query parameter (apk or aab)
      const fileType = req.query.type || 'apk';
      const fileName = `app.${fileType}`;
      
      // Build the path to the file in Firebase Storage
      const filePath = `${buildData.buildPath}/${fileName}`;
      
      // Get file reference
      const file = bucket.file(filePath);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: `${fileType.toUpperCase()} file not found in storage`
        });
      }
      
      // Generate a signed URL for the file (valid for 15 minutes)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000 // 15 minutes
      });
      
      // Redirect to the signed URL
      res.redirect(signedUrl);
    } catch (storageError) {
      console.error('Error accessing file in storage:', storageError);
      return res.status(500).json({
        success: false,
        error: 'Error accessing file in storage'
      });
    }
  } catch (error) {
    console.error('Error downloading build:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Add endpoint for manually creating a completed build record for existing files
router.post('/sync-firebase-storage', async (req, res) => {
  try {
    const buildId = '14709933897'; // Our specific build ID that exists in Firebase Storage
    
    // If using mock data, just return success
    if (useMockData()) {
      return res.json({
        success: true,
        message: 'Mock sync completed',
        data: {
          id: buildId,
          status: 'completed',
          appName: 'Tecxmate',
          webviewUrl: 'https://tw.tecxmate.com/en',
        }
      });
    }
    
    // Check if the build already exists in Firestore
    const docRef = buildsCollection.doc(buildId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      // If it exists, update it to make sure it's marked as completed
      await docRef.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        apkUrl: `https://storage.googleapis.com/${bucket.name}/builds/${buildId}/app.apk`,
        aabUrl: `https://storage.googleapis.com/${bucket.name}/builds/${buildId}/app.aab`,
        buildPath: `builds/${buildId}`
      });
      
      return res.json({
        success: true,
        message: 'Build record updated to match Firebase Storage',
        data: {
          id: buildId,
          ...doc.data(),
          status: 'completed'
        }
      });
    }
    
    // If it doesn't exist, create a new record
    await docRef.set({
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      appName: 'Tecxmate',
      webviewUrl: 'https://tw.tecxmate.com/en',
      apkUrl: `https://storage.googleapis.com/${bucket.name}/builds/${buildId}/app.apk`,
      aabUrl: `https://storage.googleapis.com/${bucket.name}/builds/${buildId}/app.aab`,
      buildPath: `builds/${buildId}`
    });
    
    return res.status(201).json({
      success: true,
      message: 'New build record created to match Firebase Storage',
      data: {
        id: buildId,
        status: 'completed',
        appName: 'Tecxmate',
        webviewUrl: 'https://tw.tecxmate.com/en'
      }
    });
  } catch (error) {
    console.error('Error syncing Firebase Storage:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

module.exports = router; 