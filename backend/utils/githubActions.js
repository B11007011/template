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
  
  // Validate required parameters
  if (!owner || !repo || !token) {
    console.error('Missing required GitHub configuration:');
    console.error('- owner:', owner ? 'provided' : 'missing');
    console.error('- repo:', repo ? 'provided' : 'missing');
    console.error('- token:', token ? 'provided (masked)' : 'missing');
    throw new Error('Missing required GitHub configuration');
  }

  // Validate the client payload contains required app build information
  if (!clientPayload.build_id || !clientPayload.app_name || !clientPayload.url) {
    console.error('Missing required build information in clientPayload:', clientPayload);
    throw new Error('Missing required build information in clientPayload');
  }

  // Log the workflow trigger (with masked sensitive data)
  console.log(`Triggering GitHub workflow with event type: ${eventType}`);
  console.log('Build payload:', {
    build_id: clientPayload.build_id,
    app_name: clientPayload.app_name,
    url: clientPayload.url
  });
  
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
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        // For repository_dispatch, GitHub returns 204 No Content when successful
        if (res.statusCode === 204 || (res.statusCode >= 200 && res.statusCode < 300)) {
          console.log(`GitHub API workflow trigger successful (${res.statusCode})`);
          resolve({
            statusCode: res.statusCode,
            data: responseData ? JSON.parse(responseData) : { status: 'success' }
          });
        } else {
          console.error(`GitHub API error: ${res.statusCode}`);
          console.error('Response:', responseData);
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