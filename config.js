// Configuration for development and production environments
const isDev = require('electron-is-dev');

// Server configuration
const SERVER_PORT = process.env.SERVER_PORT || 1212;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

// Spotify OAuth configuration
// In production, use a custom protocol (e.g., bindify://authorize)
// In development, use localhost
const REDIRECT_URI = process.env.REDIRECT_URI || 
  (isDev 
    ? `http://${SERVER_HOST}:${SERVER_PORT}/authorize`
    : 'bindify://authorize'); // Custom protocol for production

// WARNING: Remove hardcoded credentials in production
// Use environment variables instead
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '1e6240791635424c9069296ce0ff8492';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '0218655e8ff14d019342788dd96cf095';

// Socket.IO configuration
const SOCKET_URL = process.env.SOCKET_URL || 
  (isDev 
    ? `http://${SERVER_HOST}:${SERVER_PORT}`
    : 'http://localhost:1212'); // In production, server runs locally

module.exports = {
  SERVER_PORT,
  SERVER_HOST,
  REDIRECT_URI,
  CLIENT_ID,
  CLIENT_SECRET,
  SOCKET_URL,
  isDev
};

