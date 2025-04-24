// Configuration settings for the WebView App Builder
// COPY THIS FILE to config.js and add your token there
// IMPORTANT: config.js should not be committed to the repository!

const CONFIG = {
    // GitHub settings
    github: {
        // Default user and repository (can be overridden in the UI)
        owner: 'B11007011',  // Your GitHub username
        repo: 'template',    // Your repository name
        
        // GitHub Personal Access Token with appropriate permissions
        // WARNING: Never commit your token to the repository!
        token: ''  // Add your token here in the config.js file
    },
    
    // Firebase settings for Firestore integration
    firebase: {
        apiKey: '',                     // Your Firebase API Key
        authDomain: '',                 // Your Firebase Auth Domain
        projectId: '',                  // Your Firebase Project ID
        storageBucket: '',              // Your Firebase Storage Bucket
        messagingSenderId: '',          // Your Firebase Messaging Sender ID
        appId: ''                       // Your Firebase App ID
    },
    
    // Default app settings
    app: {
        name: 'WebView App',
        url: 'https://example.com'
    }
};

// Prevent accidental modification
Object.freeze(CONFIG);

// Export the configuration 
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
} 