// API Configuration
// Detect if running locally via file:// protocol or localhost
const protocol = window.location.protocol;
const hostname = window.location.hostname;

let API_BASE_URL = '';

if (protocol === 'file:') {
    // Local file development - use localhost
    API_BASE_URL = 'http://localhost:5000';
    console.log('Running locally (file://) - using development server');
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development server
    API_BASE_URL = 'http://localhost:5000';
    console.log('Running on localhost - using development server');
} else {
    // Production (Vercel or other host) - use relative paths
    API_BASE_URL = '';
    console.log('Running in production - using relative paths');
}

console.log('API Base URL:', API_BASE_URL);
console.log('Protocol:', protocol);
console.log('Hostname:', hostname);
