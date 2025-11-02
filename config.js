// Configuration for development and production environments
const isDev = require('electron-is-dev');

// Note: dotenv should be loaded in main.js and server.js before requiring config
// This file assumes environment variables are already loaded

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

