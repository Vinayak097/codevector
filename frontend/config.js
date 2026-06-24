// Frontend configuration
// This file loads environment variables for the frontend
// For production, replace this with the actual backend URL

(function() {
  // Try to get backend URL from various sources
  window.REACT_APP_BACKEND_URL = 
    // Check if already set globally
    window.REACT_APP_BACKEND_URL ||
    // Check if in development - use localhost
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:8000'
      : 'https://codevector-1caq.onrender.com');
  
  console.log('Backend URL:', window.REACT_APP_BACKEND_URL);
})();
