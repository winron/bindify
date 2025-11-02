const Store = require('electron-store');

const schema = {
  spotify: {
    type: 'object',
    properties: {
      tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      id: { type: 'string' },
      displayName: { type: 'string' },
      activeDevice: { type: 'string' },
      cached: {
        type: 'object',
        properties: {
          id: {
            type: 'object',
            properties: {
              history: { type: 'array' }
            }
          }
        }
      }
    }
  },
  shortcuts: {
    type: 'object',
    properties: {
      action: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          combination: { type: 'array' },
          enabled: { type: 'boolean' },
          hookId: { type: 'number' }
        }
      }
    }
  }
};

class DataStore {
  constructor() {
    this.dataStore = new Store({ schema });
  }

  setSpotifyProfile(data) {
    this.dataStore.set(`spotify.id`, data.id);
    this.dataStore.set(`spotify.displayName`, data.displayName);
  }

  getSpotifyProfile() {
    return {
      id: this.dataStore.get('spotify.id'),
      displayName: this.dataStore.get('spotify.displayName'),
      history: this.dataStore.get(`spotify.cached.${this.dataStore.get('spotify.id')}.history`, [])
    };
  }

  setHistory(trackData) {
    const history = this.dataStore.get(`spotify.cached.${this.dataStore.get('spotify.id')}.history`, []);
    const newHistory = [...history, trackData];
    this.dataStore.set(`spotify.cached.${this.dataStore.get('spotify.id')}.history`, newHistory);
  }

  setSpotifyActiveDevice(deviceId) {
    this.dataStore.set(`spotify.activeDevice`, deviceId);
  }

  getSpotifyActiveDevice() {
    return this.dataStore.get(`spotify.activeDevice`);
  }

  setSpotifyTokens(data) {
    this.dataStore.set('spotify.tokens', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    });
  }

  printSpotifyTokens() {
    console.log(
      'PRINTING: ' +
        this.dataStore.get('spotify.tokens.accessToken') +
        this.dataStore.get('spotify.tokens.refreshToken')
    );
  }

  getSpotifyTokens() {
    return {
      accessToken: this.dataStore.get('spotify.tokens.accessToken'),
      refreshToken: this.dataStore.get('spotify.tokens.refreshToken')
    };
  }

  hasExistingCombination(action) {
    const arrayHasNull = (arr) => arr.some((element) => element === null);
    const existingCombination = this.dataStore.get(`shortcuts.${action}.combination`);
    if (existingCombination && existingCombination.length > 0 && !arrayHasNull(existingCombination)) {
      return true;
    }
    return false;
  }

  isShortcutEnabled(action) {
    return this.dataStore.get(`shortcuts.${action}.enabled`);
  }

  getShortcutCombination(action) {
    return this.dataStore.get(`shortcuts.${action}.combination`);
  }

  getAllShortcuts() {
    return this.dataStore.get('shortcuts');
  }

  setShortcut(sc) {
    this.dataStore.set(`shortcuts.${sc.action}`, {
      label: sc.label,
      combination: sc.combination,
      enabled: sc.enabled,
      hookId: sc.hookId
    });
  }

  toggleShortcut({ action, enabled }) {
    if (!enabled) {
      this.dataStore.set(`shortcuts.${action}.combination`, []);
    }
    this.dataStore.set(`shortcuts.${action}.enabled`, enabled);
  }

  setHookId(action, hookId) {
    this.dataStore.set(`shortcuts.${action}.hookId`, hookId);
  }

  getHookId(action) {
    return this.dataStore.get(`shortcuts.${action}.hookId`);
  }

  clearHistory() {
    const userId = this.dataStore.get('spotify.id');
    if (userId) {
      this.dataStore.delete(`spotify.cached.${userId}.history`);
    }
  }

  clearShortcuts() {
    this.dataStore.delete('shortcuts');
  }

  clearAllData() {
    this.clearHistory();
    this.clearShortcuts();
  }
}

const store = new DataStore();
module.exports = store;
