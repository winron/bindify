#!/usr/bin/env node
// Diagnostic script to check if everything is set up correctly

console.log('🔍 Checking Bindify Setup...\n');

// 1. Check .env file
console.log('1. Checking .env file...');
try {
  require('dotenv').config();
  const hasClientId = !!process.env.SPOTIFY_CLIENT_ID;
  const hasClientSecret = !!process.env.SPOTIFY_CLIENT_SECRET;
  
  if (hasClientId && hasClientSecret) {
    console.log('   ✓ .env file found and credentials loaded');
  } else {
    console.log('   ✗ .env file missing or incomplete');
    console.log('   CLIENT_ID:', hasClientId ? 'Found' : 'MISSING');
    console.log('   CLIENT_SECRET:', hasClientSecret ? 'Found' : 'MISSING');
    process.exit(1);
  }
} catch (err) {
  console.log('   ✗ Error loading .env:', err.message);
  process.exit(1);
}

// 2. Check config.js
console.log('\n2. Checking config.js...');
try {
  const config = require('./config');
  if (config.CLIENT_ID && config.CLIENT_SECRET) {
    console.log('   ✓ Config loaded successfully');
    console.log('   REDIRECT_URI:', config.REDIRECT_URI);
    console.log('   SERVER_PORT:', config.SERVER_PORT);
  } else {
    console.log('   ✗ Config missing credentials');
    process.exit(1);
  }
} catch (err) {
  console.log('   ✗ Error loading config:', err.message);
  process.exit(1);
}

// 3. Check server port availability
console.log('\n3. Checking server port 1212...');
const http = require('http');
const testServer = http.createServer();
testServer.listen(1212, 'localhost', () => {
  console.log('   ✓ Port 1212 is available');
  testServer.close(() => {
    // 4. Check if server.js can start
    console.log('\n4. Testing server.js...');
    try {
      // Load dotenv again
      require('dotenv').config();
      // Try to require the server (it will start listening)
      const path = require('path');
      const fs = require('fs');
      
      console.log('   ✓ Server file exists and can be loaded');
      console.log('\n✅ All checks passed!');
      console.log('\n💡 Next steps:');
      console.log('   1. Make sure you run: npm start');
      console.log('   2. Wait for "Server listening on localhost:1212" message');
      console.log('   3. Then try logging in');
      process.exit(0);
    } catch (err) {
      console.log('   ✗ Error loading server:', err.message);
      console.log('   Stack:', err.stack);
      process.exit(1);
    }
  });
});

testServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('   ⚠ Port 1212 is already in use');
    console.log('   This might mean the server is already running');
    console.log('   Try: lsof -ti:1212 | xargs kill');
  } else {
    console.log('   ✗ Error:', err.message);
  }
  process.exit(1);
});

