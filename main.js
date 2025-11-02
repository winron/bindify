// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut, protocol } = require('electron');
const shell = require('electron').shell;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

// Load environment variables from .env file BEFORE requiring config
// This must happen in the main process, not just in config.js
if (isDev) {
  try {
    require('dotenv').config();
  } catch (err) {
    console.warn('dotenv not available, using environment variables or defaults');
  }
}

const io = require('socket.io-client');
const config = require('./config');
const store = require('./src/renderer/classes/Store');

let pendingProtocolURL = null;

// Set up custom protocol handler for production (bindify://)
if (!isDev) {
  app.setAsDefaultProtocolClient('bindify');
  
  // Handle protocol URLs (bindify://authorize?code=...) - macOS
  app.on('open-url', (event, urlString) => {
    event.preventDefault();
    if (mainWindow && !mainWindow.isDestroyed()) {
      handleProtocolURL(urlString);
    } else {
      pendingProtocolURL = urlString;
    }
  });
}

// For Windows/Linux, handle protocol via command line arguments
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    
    // Handle protocol URL from command line (Windows/Linux)
    const urlString = commandLine.find(arg => arg.startsWith('bindify://'));
    if (urlString) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        handleProtocolURL(urlString);
      } else {
        pendingProtocolURL = urlString;
      }
    }
  });
}

function handleProtocolURL(urlString) {
  try {
    const urlObj = new URL(urlString);
    if (urlObj.pathname === '/authorize') {
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('handle-spotify-authorized', code || error);
      }
      
      // Also close child window if it exists
      if (childWindow && !childWindow.isDestroyed()) {
        childWindow.close();
      }
    }
  } catch (err) {
    console.error('Error handling protocol URL:', err);
  }
}

const socket = io(config.SOCKET_URL);
let ioHook = null;
let isUsingNewAPI = false;

// Try iohook first (has registerShortcut API which matches existing code)
try {
  ioHook = require('iohook');
  console.log('iohook loaded successfully');
} catch (err) {
  console.warn('iohook not available (likely ARM64). Trying uiohook-napi...');
  try {
    const { uIOhook } = require('uiohook-napi');
    ioHook = uIOhook;
    isUsingNewAPI = true;
    console.log('uiohook-napi loaded successfully (note: shortcuts feature may be limited)');
  } catch (err2) {
    console.warn('Neither iohook nor uiohook-napi available. Keyboard shortcuts will be disabled.');
    console.warn('Error:', err2.message);
  }
}

const spotifyWebApi = require('./src/renderer/classes/Spotify');
const asyncLock = require('./src/renderer/classes/AsyncLock');

try {
	require('electron-reloader')(module);
} catch {}

let prevThrottleDate = +new Date();
let pressedKeys = new Set(); // Track currently pressed keys for uiohook-napi

if (ioHook && !isUsingNewAPI) {
  try {
    ioHook.start();
  } catch (err) {
    console.warn('Failed to start iohook:', err.message);
    ioHook = null;
  }
} else if (ioHook && isUsingNewAPI) {
  try {
    ioHook.start();
    console.log('uiohook-napi started - setting up event-based shortcuts');
    
    // Setup event listeners for uiohook-napi
    ioHook.on('keydown', (e) => {
      pressedKeys.add(e.keycode);
      checkShortcutMatch();
    });
    
    ioHook.on('keyup', (e) => {
      pressedKeys.delete(e.keycode);
    });
    
  } catch (err) {
    console.warn('Failed to start uiohook-napi:', err.message);
    ioHook = null;
  }
}

const intialStore = {
  shortcuts: {
    saveToMyLikedSongs: {
      hookId: 0,
      label: 'Save to My Liked Songs',
      combination: [],
      enabled: false
    },
    unsaveFromMyLikedSongs: {
      hookId: 0,
      label: 'Unsave from My Liked Songs',
      combination: [],
      enabled: false
    },
    playPause: {
      hookId: 0,
      label: 'Play/ Pause',
      combination: [],
      enabled: false
    }
  }
};

// Helper to compare arrays efficiently
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Check if pressed keys match any registered shortcuts (for uiohook-napi)
function checkShortcutMatch() {
  if (!isUsingNewAPI || !mainWindow) return;
  
  const pressedKeysArray = Array.from(pressedKeys).sort((a, b) => a - b);
  
  Object.keys(intialStore.shortcuts).forEach((action) => {
    if (!store.isShortcutEnabled(action)) return;
    
    const combination = store.getShortcutCombination(action);
    if (!combination || combination.length === 0) return;
    
    // Convert combination to numbers and sort
    const targetCombination = combination.map(k => parseInt(k)).sort((a, b) => a - b);
    
    // Check if arrays match using efficient comparison
    if (arraysEqual(pressedKeysArray, targetCombination)) {
      if (isDev) {
        console.log('Shortcut matched:', action);
      }
      executeShortcutAction(action);
    }
  });
}

// Execute the action for a matched shortcut
function executeShortcutAction(action) {
  switch (action) {
    case 'saveToMyLikedSongs': {
      queueSpotifyAction(async () => {
        return await spotifyWebApi.saveToMyLikedSongs();
      });
      break;
    }
    case 'unsaveFromMyLikedSongs': {
      queueSpotifyAction(async () => {
        return await spotifyWebApi.unsaveFromMyLikedSongs();
      });
      break;
    }
    case 'playPause': {
      queueSpotifyAction(async () => {
        return await spotifyWebApi.playPause();
      });
      break;
    }
    default: {
      break;
    }
  }
}

function loadExistingShortcuts() {
  // Initialize shortcuts in store even if hook is not available
  Object.keys(intialStore.shortcuts).forEach((action) => {
    if (!store.hasExistingCombination(action)) {
      // Set initial shortcut data if it doesn't exist
      store.setShortcut({ action, ...intialStore.shortcuts[action] });
    }
  });
  
  // Only register shortcuts if we have the old iohook API
  if (!ioHook) {
    console.warn('ioHook not available, shortcuts initialized but not registered');
    return;
  }
  if (isUsingNewAPI) {
    console.log('uiohook-napi: shortcuts are registered via event listeners (already set up)');
    return;
  }
  
  // Register shortcuts with old iohook API
  ioHook.unregisterAllShortcuts();
  Object.keys(intialStore.shortcuts).forEach((action) => {
    if (store.hasExistingCombination(action) && store.isShortcutEnabled(action)) {
      registerShortcutByAction({ action: action, combination: store.getShortcutCombination(action) });
    }
  });
}

async function queueSpotifyAction(callback) {
  await asyncLock.bottleneck;
  asyncLock.enable();
  const now = +new Date();
  
  if (now - prevThrottleDate > 750) {
    prevThrottleDate = now;
    const response = await callback();
    if (response) {
      const now = new Date().toLocaleString("en-US");
      response.timestamp = now;
      if (response?.trackData) {
        response.trackData.timestamp = now;
        store.setHistory(response.trackData);
      }
      mainWindow.webContents.send('set-logger', response);
    }
  }
  asyncLock.disable();
}

function registerShortcutByAction({ action, combination }) {
  if (!ioHook) {
    console.warn('ioHook not available, cannot register shortcut for action:', action);
    return;
  }
  
  if (isUsingNewAPI) {
    console.log(`uiohook-napi: Shortcut "${action}" registered with combination:`, combination);
    console.log('Shortcut will be detected via keydown/keyup events');
    return;
  }
  
  switch (action) {
    case 'saveToMyLikedSongs': {
      const hookId = ioHook.registerShortcut(combination,  async () => {
          queueSpotifyAction( async() => {
          return await spotifyWebApi.saveToMyLikedSongs();
        });
      });
      store.setHookId(action, hookId);
      break;
    }
    case 'unsaveFromMyLikedSongs': {
      const hookId = ioHook.registerShortcut(combination, async () => {
        queueSpotifyAction(async () => {
          return await spotifyWebApi.unsaveFromMyLikedSongs();
        });
      });
      store.setHookId(action, hookId);
      break;
    }
    case 'playPause': {
      const hookId = ioHook.registerShortcut(combination, async () => {
         queueSpotifyAction ( async () => {
          return await spotifyWebApi.playPause();
        });
      });
      store.setHookId(action, hookId);
      break;
    }
    default: {
      break;
    }
  }
}

let mainWindow = null;
let childWindow = null;

function createWindow() {
  // express server is started here when production build
  if (!isDev) {
    require(path.join(__dirname, 'build-server/server'));
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    //frame: false,
    autoHideMenuBar: true,
    resizable: false,
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : url.format({
          pathname: path.join(__dirname, 'build/index.html'),
          protocol: 'file:',
          slashes: true
        })
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow.on('system-context-menu', (event, _point) => {
    event.preventDefault();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Handle any pending protocol URL that arrived before window was ready
    if (pendingProtocolURL) {
      handleProtocolURL(pendingProtocolURL);
      pendingProtocolURL = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('will-quit', function () {
  if (ioHook && !isUsingNewAPI) {
    ioHook.unregisterAllShortcuts();
  } else if (ioHook && isUsingNewAPI) {
    ioHook.stop();
  }
});

socket.on('authorization-from-spotify', async function (data) {
  if (childWindow !== null && !childWindow.closed) {
    childWindow.close();
  }
  if (data?.status === 200) {
    const c = await spotifyWebApi.authorizationCodeGrant(data?.code, store);
    mainWindow.webContents.send('handle-spotify-authorized', data?.code);
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('to-main', async (event, args) => {
  const { channel, data } = args;
  switch (channel) {
    case 'start-spotify-authorization': {
      if (childWindow === null) {
        childWindow = new BrowserWindow({ parent: mainWindow, width: 800, height: 600, show: false });
      }
      childWindow.loadURL(spotifyWebApi.getAuthorizeURL());
      childWindow.once('ready-to-show', () => {
        childWindow.show();
      });
      childWindow.on('closed', () => {
        childWindow = null;
      });
      break;
    }
    case 'get-profile': {
      spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
      const response = await spotifyWebApi.getUser();

      if(response?.isSuccess) {
        store.setSpotifyProfile(response?.data);
        mainWindow.webContents.send('set-profile-and-history', store.getSpotifyProfile());
      } 
      const now = new Date().toLocaleString("en-US");
      response.timestamp = now;     
      mainWindow.webContents.send('set-logger', response);
      //store.printSpotifyTokens();
      break;
    }
    //first call on landing page. entry point to authorized spotify endpoints
    case 'get-shortcuts': {
      //spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
      loadExistingShortcuts();
      mainWindow.webContents.send('set-shortcuts', store.getAllShortcuts());
      //store.printSpotifyTokens();
      break;
    }
    case 'register-globalshortcut': {
      const oldHookId = store.getHookId(data.action);
      if (ioHook && !isUsingNewAPI && store.hasExistingCombination(data.action) && oldHookId) {
        ioHook.unregisterShortcut(oldHookId);
      }
      store.setShortcut(data);
      registerShortcutByAction(data);
      mainWindow.webContents.send('set-shortcuts', store.getAllShortcuts());
      break;
    }
    case 'toggle-globalshortcut': {
      const oldHookId = store.getHookId(data.action);
      if (ioHook && !isUsingNewAPI && store.hasExistingCombination(data.action) && !data.enabled && store.hasExistingCombination(data.action)) {
        ioHook.unregisterShortcut(oldHookId);
      }
      store.toggleShortcut(data);
      mainWindow.webContents.send('set-shortcuts', store.getAllShortcuts());
      break;
    }
    case 'play-track': {
      spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
      const response = await spotifyWebApi.playTrack(data.trackUri);
      const now = new Date().toLocaleString("en-US");
      response.timestamp = now;
      mainWindow.webContents.send('set-logger', response);
      // Update playback state after playing
      setTimeout(async () => {
        spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
        const playbackState = await spotifyWebApi.spotifyWebApi.getMyCurrentPlaybackState();
        if (playbackState.statusCode === 200 && playbackState.body) {
          mainWindow.webContents.send('current-playback-state', {
            isPlaying: playbackState.body.is_playing,
            item: playbackState.body.item
          });
        }
      }, 500);
      break;
    }
    case 'get-current-playback-state': {
      spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
      const playbackState = await spotifyWebApi.spotifyWebApi.getMyCurrentPlaybackState();
      if (playbackState.statusCode === 200 && playbackState.body) {
        mainWindow.webContents.send('current-playback-state', {
          isPlaying: playbackState.body.is_playing,
          item: playbackState.body.item
        });
      } else {
        mainWindow.webContents.send('current-playback-state', {
          isPlaying: false,
          item: null
        });
      }
      break;
    }
    case 'play-pause-track': {
      spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
      const response = await spotifyWebApi.playPause();
      const now = new Date().toLocaleString("en-US");
      response.timestamp = now;
      mainWindow.webContents.send('set-logger', response);
      // Update playback state after play/pause
      setTimeout(async () => {
        spotifyWebApi.setCachedTokens(store.getSpotifyTokens());
        const playbackState = await spotifyWebApi.spotifyWebApi.getMyCurrentPlaybackState();
        if (playbackState.statusCode === 200 && playbackState.body) {
          mainWindow.webContents.send('current-playback-state', {
            isPlaying: playbackState.body.is_playing,
            item: playbackState.body.item
          });
        } else {
          mainWindow.webContents.send('current-playback-state', {
            isPlaying: false,
            item: null
          });
        }
      }, 500);
      break;
    }
    case 'clear-all-data': {
      store.clearAllData();
      // Reset shortcuts to initial state
      loadExistingShortcuts();
      mainWindow.webContents.send('set-shortcuts', store.getAllShortcuts());
      // Notify to clear in-memory state
      mainWindow.webContents.send('clear-all-data-complete');
      break;
    }
    default: {
      console.log('unhandled channel');
    }
  }
});
