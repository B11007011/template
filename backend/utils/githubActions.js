const https = require('https');

/**
 * Trigger a GitHub Actions workflow using the repository_dispatch event
 * @param {Object} options - Configuration options
 * @param {string} options.owner - The GitHub repository owner
 * @param {string} options.repo - The GitHub repository name
 * @param {string} options.token - GitHub personal access token
 * @param {string} options.eventType - The event type for the repository_dispatch event
 * @param {Object} options.clientPayload - The client payload for the event
 * @returns {Promise<Object>} - Response from the GitHub API
 */
const triggerWorkflow = async (options) => {
  const { owner, repo, token, eventType, clientPayload } = options;
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      event_type: eventType,
      client_payload: clientPayload
    });
    
    const requestOptions = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${owner}/${repo}/dispatches`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: res.statusCode,
            data: responseData ? JSON.parse(responseData) : {}
          });
        } else {
          reject({
            statusCode: res.statusCode,
            message: `GitHub API responded with status code ${res.statusCode}`,
            data: responseData ? JSON.parse(responseData) : {}
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('GitHub API Request Error:', error);
      console.error('Request details:', {
        url: `https://api.github.com/repos/${owner}/${repo}/dispatches`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ****${token?.slice(-4) || ''}`,
          'User-Agent': 'Node.js'
        },
        payload: JSON.stringify({
          event_type: eventType,
          client_payload: clientPayload
        })
      });
      
      reject({
        message: 'Error making request to GitHub API',
        error
      });
    });
    
    req.write(data);
    req.end();
  });
};

module.exports = {
  triggerWorkflow
}; 