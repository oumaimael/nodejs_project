// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' // Local development backend
    : ''; // Production (relative path)

console.log('API Base URL:', API_BASE_URL);
