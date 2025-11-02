// Configuration for development and production environments
const isDev = require('electron-is-dev');

// Load environment variables from .env file
// Note: In Electron, we need to handle .env loading manually
if (isDev) {
  try {
    require('dotenv').config();
  } catch (err) {
    // dotenv not installed or .env not found - that's okay
    console.warn('dotenv not available, using environment variables or defaults');
  }
}

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

// Spotify OAuth credentials - MUST be set via environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables or .env file');
}

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

