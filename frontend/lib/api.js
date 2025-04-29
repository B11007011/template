/**
 * API Client for handling all API requests
 */

// Get API URL from environment or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base API fetch function with error handling
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - Parsed response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    cache: 'no-store',
  };

  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`API Request: ${fetchOptions.method || 'GET'} ${url}`);
    
    const response = await fetch(url, fetchOptions);
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData;
      try {
        // Try to parse error as JSON
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch (e) {
        errorData = 'Unknown error';
      }
      
      const errorMessage = 
        typeof errorData === 'object' && errorData.message 
          ? errorData.message 
          : typeof errorData === 'string' 
            ? errorData 
            : `Error ${response.status}`;
      
      console.error('API Error:', response.status, errorMessage);
      
      // Create an error object with additional information
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      throw error;
    }
    
    // Return different types based on content type
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } else if (contentType && (
      contentType.includes('application/octet-stream') || 
      contentType.includes('application/zip')
    )) {
      // Return the response directly for file downloads
      return response;
    } else {
      // Default to text
      const text = await response.text();
      return text;
    }
  } catch (error) {
    if (!error.status) {
      console.error('Network Error:', error);
      // This is likely a network error
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

/**
 * API client with methods for different endpoints
 */
const api = {
  // Builds endpoints
  builds: {
    getAll: () => apiRequest('/builds'),
    getById: (id) => apiRequest(`/builds/${id}`),
    downloadBuild: (id) => apiRequest(`/builds/${id}/download`),
    createBuild: (data) => apiRequest('/builds/trigger', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deleteBuild: (id) => apiRequest(`/builds/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Convert website endpoints
  convert: {
    toApp: (websiteUrl) => apiRequest('/convert-to-app', {
      method: 'POST',
      body: JSON.stringify({ websiteUrl }),
    }),
  },
  
  // Upload endpoints
  upload: {
    file: (formData) => apiRequest('/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type when uploading files with FormData
        // It will be set automatically with the correct boundary
      },
      body: formData,
    }),
  },
};

export default api; 