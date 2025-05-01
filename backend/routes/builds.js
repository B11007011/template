const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { triggerWorkflow } = require('../utils/githubActions');

const db = admin.firestore();
const bucket = admin.storage().bucket();
const buildsCollection = db.collection('builds');

// Helper to determine if we should use mock data
const useMockData = () => {
  // Always use real data
  console.log('Using real Firebase data (forced via code)');
  return false;
};

// Helper to calculate expiration date (30 days from now)
const calculateExpirationDate = () => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  return expirationDate;
};

// Function to check and delete expired builds (files older than 30 days)
const deleteExpiredBuilds = async () => {
  try {
    console.log('Checking for expired builds...');
    const now = new Date();
    
    // Query all completed builds
    const snapshot = await buildsCollection
      .where('status', '==', 'completed')
      .where('expirationDate', '<=', now)
      .get();
    
    if (snapshot.empty) {
      console.log('No expired builds found');
      return;
    }
    
    console.log(`Found ${snapshot.size} expired builds to delete`);
    
    // Delete each expired build
    const batch = db.batch();
    const deletedBuilds = [];
    
    for (const doc of snapshot.docs) {
      const buildData = doc.data();
      const buildId = doc.id;
      
      // Skip the special build
      if (buildId === '14709933897') {
        console.log(`Skipping deletion of special build ${buildId}`);
        continue;
      }
      
      console.log(`Deleting expired build ${buildId}`);
      
      // Delete files from Storage if they exist
      if (buildData.buildPath) {
        try {
          await bucket.deleteFiles({
            prefix: buildData.buildPath
          });
          console.log(`Deleted files for expired build ${buildId}`);
        } catch (storageError) {
          console.error(`Error deleting files from storage for build ${buildId}:`, storageError);
        }
      }
      
      // Queue document for deletion
      batch.delete(doc.ref);
      deletedBuilds.push(buildId);
    }
    
    // Commit the batch deletion
    if (deletedBuilds.length > 0) {
      await batch.commit();
      console.log(`Successfully deleted ${deletedBuilds.length} expired builds: ${deletedBuilds.join(', ')}`);
    }
  } catch (error) {
    console.error('Error deleting expired builds:', error);
  }
};

// Run expired builds cleanup every day
setInterval(deleteExpiredBuilds, 24 * 60 * 60 * 1000);
// Also run it once on server start
setTimeout(deleteExpiredBuilds, 60 * 1000);

// Initialize the special build record if it doesn't exist
(async function initializeSpecialBuild() {
  const specialBuildId = '14709933897';
  try {
    console.log(`Initializing special build ${specialBuildId}...`);
    
    // Never expires (specialBuildId is exempt from expiration)
    const farFutureDate = new Date();
    farFutureDate.setFullYear(farFutureDate.getFullYear() + 10);
    
    // Use set with merge to create or update without fetching first
    await buildsCollection.doc(specialBuildId).set({
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      expirationDate: farFutureDate,
      appName: 'Tecxmate',
      webviewUrl: 'https://tw.tecxmate.com/en',
      apkUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${specialBuildId}/app.apk`,
      aabUrl: `https://storage.googleapis.com/trader-35173.firebasestorage.app/builds/${specialBuildId}/app.aab`,
      buildPath: `builds/${specialBuildId}`
    }, { merge: true });
    
    console.log(`Special build ${specialBuildId} initialized successfully.`);
  } catch (error) {
    console.error(`Error initializing special build ${specialBuildId}:`, error);
  }
})();

// Get all builds
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to query Firestore collection: builds');
    console.log('Firestore instance:', db._settings ? `projectId: ${db._settings.projectId}` : 'settings not available');
    
    const snapshot = await buildsCollection.orderBy('createdAt', 'desc').get();
    const builds = [];
    
    snapshot.forEach(doc => {
      const buildData = doc.data();
      const build = {
        id: doc.id,
        ...buildData
      };
      
      // Calculate days remaining before expiration for completed builds
      if (build.status === 'completed' && build.expirationDate) {
        const now = new Date();
        const expirationDate = build.expirationDate instanceof Date 
          ? build.expirationDate 
          : new Date(build.expirationDate);
        
        if (isNaN(expirationDate.getTime())) {
          build.daysRemaining = null;
        } else {
          const diffTime = expirationDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          build.daysRemaining = Math.max(0, diffDays);
        }
      }
      
      builds.push(build);
    });
    
    console.log(`Successfully retrieved ${builds.length} builds from Firestore`);
    
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
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to retrieve builds'
    });
  }
});

// Get a specific build by ID
router.get('/:id', async (req, res) => {
  try {
    const buildId = req.params.id;
    
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
    
    // Calculate days remaining before expiration for completed builds
    if (buildData.status === 'completed' && buildData.expirationDate) {
      const now = new Date();
      const expirationDate = buildData.expirationDate instanceof Date 
        ? buildData.expirationDate 
        : new Date(buildData.expirationDate);
      
      if (!isNaN(expirationDate.getTime())) {
        const diffTime = expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        buildData.daysRemaining = Math.max(0, diffDays);
      }
    }
    
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
          
          // Calculate expiration date (30 days from now)
          const expirationDate = calculateExpirationDate();
          
          // Update the build in Firestore
          await buildsCollection.doc(buildId).update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            expirationDate: expirationDate,
            apkUrl,
            aabUrl,
            buildPath
          });
          
          // Update the response data
          buildData.status = 'completed';
          buildData.completedAt = new Date().toISOString();
          buildData.expirationDate = expirationDate;
          buildData.daysRemaining = 30; // Just completed, so 30 days remaining
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
    console.log(`Attempting to delete build with ID: ${buildId}`);
    
    // Special case for our static Firebase Storage build
    // if (buildId === '14709933897') {
    //   console.log(`Skipping deletion of special build ${buildId}`);
    //   return res.json({
    //     success: true,
    //     data: {},
    //     message: 'Demo build cannot be deleted from server'
    //   });
    // }
    
    const doc = await buildsCollection.doc(buildId).get();
    
    if (!doc.exists) {
      console.log(`Build ${buildId} not found in Firestore`);
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    const buildData = doc.data();
    console.log(`Found build to delete: ${buildId}, name: ${buildData.appName}, status: ${buildData.status}`);
    
    // Delete files from Storage if they exist
    if (buildData.buildPath) {
      try {
        console.log(`Attempting to delete files from path: ${buildData.buildPath}`);
        await bucket.deleteFiles({
          prefix: buildData.buildPath
        });
        console.log(`Successfully deleted files from path: ${buildData.buildPath}`);
      } catch (storageError) {
        console.error(`Error deleting files from storage for build ${buildId}:`, storageError);
        // Continue with document deletion even if file deletion fails
      }
    }
    
    // Delete the Firestore document
    console.log(`Deleting Firestore document for build ${buildId}`);
    await buildsCollection.doc(buildId).delete();
    console.log(`Successfully deleted Firestore document for build ${buildId}`);
    
    res.json({
      success: true,
      data: {},
      message: 'Build deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting build ${req.params.id}:`, error);
    
    // Add specific error codes and more detail
    if (error.code) {
      console.error(`Firestore error code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`Error details: ${error.details}`);
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Unknown error occurred during deletion',
      code: error.code
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

// Endpoint to run the expired build cleanup manually
router.post('/cleanup-expired', async (req, res) => {
  try {
    await deleteExpiredBuilds();
    res.json({
      success: true,
      message: 'Expired builds cleanup triggered successfully'
    });
  } catch (error) {
    console.error('Error running expired builds cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Force delete a build (only removes from Firestore, ignores storage errors)
router.delete('/:id/force', async (req, res) => {
  try {
    const buildId = req.params.id;
    console.log(`Force-deleting build with ID: ${buildId}`);
    
    // Special case for our static Firebase Storage build
    if (buildId === '14709933897') {
      console.log(`Cannot force-delete special build ${buildId}`);
      return res.json({
        success: true,
        data: {},
        message: 'Demo build cannot be deleted from server'
      });
    }
    
    const doc = await buildsCollection.doc(buildId).get();
    
    if (!doc.exists) {
      console.log(`Build ${buildId} not found in Firestore`);
      return res.status(404).json({
        success: false,
        error: 'Build not found'
      });
    }
    
    const buildData = doc.data();
    console.log(`Found build to force-delete: ${buildId}, name: ${buildData.appName}, status: ${buildData.status}`);
    
    // Try to delete files from Storage if they exist, but continue even if it fails
    if (buildData.buildPath) {
      try {
        console.log(`Attempting to delete files from path: ${buildData.buildPath}`);
        await bucket.deleteFiles({
          prefix: buildData.buildPath
        });
        console.log(`Successfully deleted files from path: ${buildData.buildPath}`);
      } catch (storageError) {
        console.error(`Error deleting files from storage for build ${buildId}:`, storageError);
        console.log(`Continuing with Firestore document deletion despite storage error`);
      }
    }
    
    // Delete the Firestore document (this is the only important part in force delete)
    console.log(`Deleting Firestore document for build ${buildId}`);
    await buildsCollection.doc(buildId).delete();
    console.log(`Successfully force-deleted Firestore document for build ${buildId}`);
    
    res.json({
      success: true,
      data: {},
      message: 'Build force-deleted successfully'
    });
  } catch (error) {
    console.error(`Error force-deleting build ${req.params.id}:`, error);
    
    if (error.code) {
      console.error(`Firestore error code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`Error details: ${error.details}`);
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Unknown error occurred during force deletion',
      code: error.code
    });
  }
});

module.exports = router; 