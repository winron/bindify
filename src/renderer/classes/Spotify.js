const SpotifyWebApi = require('spotify-web-api-node');
const store = require('./Store');
const config = require('../../../config');

const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;
const REDIRECT_URI = config.REDIRECT_URI;
const SCOPES = [
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-modify',
  'user-library-read'
];
const STATE = '';
const SHOW_DIALOG = true;

class SpotifyWebAPI {
  constructor() {
    this.spotifyWebApi = new SpotifyWebApi({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URI
    });
  }

  getAuthorizeURL() {
    return this.spotifyWebApi.createAuthorizeURL(SCOPES, STATE, SHOW_DIALOG);
  }

  //TODO: handle return message for user feedback?
  setCachedTokens({ accessToken, refreshToken }) {
    this.spotifyWebApi.setAccessToken(accessToken);
    this.spotifyWebApi.setRefreshToken(refreshToken);
  }

  async handleError(err, callback) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log('Error statusCode:', err.statusCode);
    }
    
    if (err.statusCode === 401) {
      return await this.spotifyWebApi.refreshAccessToken().then(
        (data) => {
          this.spotifyWebApi.setAccessToken(data.body.access_token);
          this.spotifyWebApi.setRefreshToken(data.body.refresh_token);
          store.setSpotifyTokens(data.body);
          return callback();
        },
        (error) => {
          if (isDev) {
            console.error('Token refresh error:', error.body?.error_description);
          }
          return {
            statusCode: error.statusCode,
            message: [{ error: error.body.error_description }],
            isSuccess: false
          };
        }
      );
    }
    
    if (isDev) {
      console.error('Unhandled error:', err);
    }
    return {
      statusCode: err.statusCode, //NEED TO FORCE USER TO LOG OUT (403 statuscode is non prem user need logout)
      message: [{ error: 'Error unhandled.' }],
      isSuccess: false
    };
  }

  async authorizationCodeGrant(code) {
    return await this.spotifyWebApi.authorizationCodeGrant(code).then(
      (data) => {
        this.spotifyWebApi.setAccessToken(data.body.access_token);
        this.spotifyWebApi.setRefreshToken(data.body.refresh_token);
        store.setSpotifyTokens(data.body);
        return {
          statusCode: 200,
          message: [{ desc: 'Login successful.' }],
          isSuccess: true
        };
      },
      (err) => {
        return this.handleError(err, (code) => {
          this.authorizationCodeGrant(code);
        });
      }
    );
  }

  async getUser() {
    return await this.spotifyWebApi.getMe().then(
       (data) => {
        return {
          statusCode: 200,
          message: [{ desc: 'Profile retrieved.' }],
          data: {
            id: data.body.id,
            displayName: data.body.display_name,
          },
          isSuccess: true
        }
      },
       (err) => {
        return this.handleError(err, (code) => {
          this.getUser(code);
        });
      }
    );
  }

  async getMyCurrentPlaybackState(action) {
    return await this.spotifyWebApi.getMyCurrentPlaybackState().then(
      (data) => {
        if (data.statusCode === 200) {
          if (!data?.body?.item) {
            return {
              statusCode: 204,
              message: [{ error: 'No playback available.' }],
              isSuccess: false
            };
          }
          if (action === 'saveToMyLikedSongs') {
            return this.containsMySavedTracks([data.body.item.id]).then((saveToMyLikedSongsResponse) => {
              if (saveToMyLikedSongsResponse.statusCode === 200) {
                saveToMyLikedSongsResponse.message = [
                  { desc: `Saved to user's library:` },
                  { track: data.body.item.name },
                  { artist: data.body.item.artists[0].name }
                ];
                saveToMyLikedSongsResponse.trackData = {
                  album: data.body.item.album.name,
                  image: data.body.item.album.images,
                  artists: data.body.item.artists,
                  name: data.body.item.name,
                  uri: data.body.item.uri,
                  id: data.body.item.id
                };
              } else if (saveToMyLikedSongsResponse.statusCode === 202) {
                saveToMyLikedSongsResponse.message = [
                  { desc: `Track already in user's library.` },
                  { track: data.body.item.name },
                  { artist: data.body.item.artists[0].name }
                ];
              }
              return saveToMyLikedSongsResponse;
            });
          } else if (action === 'unsaveFromMyLikedSongs') {
            return this.checkAndRemoveFromMySavedTracks([data.body.item.id]).then((unsaveFromMyLikedSongsResponse) => {
              if (unsaveFromMyLikedSongsResponse.statusCode === 200) {
                unsaveFromMyLikedSongsResponse.message = [
                  { desc: `Removed from user's library:` },
                  { track: data.body.item.name },
                  { artist: data.body.item.artists[0].name }
                ];
                unsaveFromMyLikedSongsResponse.trackData = {
                  album: data.body.item.album.name,
                  image: data.body.item.album.images,
                  artists: data.body.item.artists,
                  name: data.body.item.name,
                  uri: data.body.item.uri,
                  id: data.body.item.id
                };
              } else if (unsaveFromMyLikedSongsResponse.statusCode === 202) {
                unsaveFromMyLikedSongsResponse.message = [
                  { desc: `Track not in user's library.` },
                  { track: data.body.item.name },
                  { artist: data.body.item.artists[0].name }
                ];
              }
              return unsaveFromMyLikedSongsResponse;
            });
          } else if (action === 'playPause') {
            return data.body.is_playing
              ? this.pause({ device_id: { device_id: data.body.device.id } }).then((playPauseResponse) => {
                  if (playPauseResponse.statusCode === 200) {
                    playPauseResponse.message = [
                      { desc: `Pausing:` },
                      { track: data.body.item.name },
                      { artist: data.body.item.artists[0].name },
                      { device: data.body.device.name }
                    ];
                  }
                  return playPauseResponse;
                })
              : this.play({ device_id: { device_id: data.body.device.id } }).then((playPauseResponse) => {
                  if (playPauseResponse.statusCode === 200) {
                    playPauseResponse.message = [
                      { desc: `Playing:` },
                      { track: data.body.item.name },
                      { artist: data.body.item.artists[0].name },
                      { device: data.body.device.name }
                    ];
                  }
                  return playPauseResponse;
                });
          }
        } else if (data.statusCode === 204) {
          return this.getMyDevices(action);
        }
      },
      (err) => {
        return this.handleError(err, (action) => {
          this.getMyCurrentPlaybackState(action);
        });
      }
    );
  }

  async containsMySavedTracks(track) {
    return await this.spotifyWebApi.containsMySavedTracks(track).then(
      (data) => {
        const found = data.body[0];
        if (found) {
          return { statusCode: 202, isSuccess: true };
        }
        return this.addToMySavedTracks(track);
      },
      (err) => {
        return this.handleError(err);
      }
    );
  }

  async addToMySavedTracks(track) {
    return await this.spotifyWebApi.addToMySavedTracks(track).then(
      () => {
        return { statusCode: 200, isSuccess: true };
      },
      (err) => {
        return this.handleError(err);
      }
    );
  }

  async checkAndRemoveFromMySavedTracks(track) {
    return await this.spotifyWebApi.containsMySavedTracks(track).then(
      (data) => {
        const found = data.body[0];
        if (found) {
          return this.removeFromMySavedTracks(track);
        }
        return { statusCode: 202, isSuccess: true };
      },
      (err) => {
        return this.handleError(err);
      }
    );
  }

  async removeFromMySavedTracks(track) {
    return await this.spotifyWebApi.removeFromMySavedTracks(track).then(
      () => {
        return { statusCode: 200, isSuccess: true };
      },
      (err) => {
        return this.handleError(err);
      }
    );
  }

  async play(device_id) {
    return await this.spotifyWebApi.play(device_id).then(
      () => {
        return { statusCode: 200, isSuccess: true };
      },
      (err) => {
        return this.handleError(err, () => {
          this.play(device_id);
        });
      }
    );
  }

  async pause(device_id) {
    return await this.spotifyWebApi.pause(device_id).then(
      () => {
        return { statusCode: 200, isSuccess: true };
      },
      (err) => {
        return this.handleError(err, () => {
          this.pause(device_id);
        });
      }
    );
  }

  //TODO: prioritize computer, smartphone, speaker?
  selectActiveDevice(availableDevices) {
    const cachedActiveDevice = store.getSpotifyActiveDevice();
    if (!availableDevices || availableDevices.length <= 0) {
      return cachedActiveDevice;
    }
    return availableDevices[0].id;
  }

  async getMyDevices(action) {
    return await this.spotifyWebApi.getMyDevices().then(
      (data) => {
        const availableDevices = data.body.devices;
        const activeDevice = this.selectActiveDevice(availableDevices);
        if (!activeDevice) {
          return {
            statusCode: 204,
            message: [{ error: 'No playback available.' }],
            isSuccess: false
          };
        }
        return this.transferMyPlayback(action, activeDevice);
      },
      (err) => {
        this.handleError(err, (action) => {
          this.getMyCurrentPlaybackState(action);
        });
      }
    );
  }

  async transferMyPlayback(action, activeDevice) {
    return await this.spotifyWebApi.transferMyPlayback([activeDevice]).then(
      () => {
        // setTimeout(() => {
        return this.getMyCurrentPlaybackState(action);
        // }, 2000);
      },
      (err) => {
        return this.handleError(err);
      }
    );
  }

  async saveToMyLikedSongs() {
    return await this.getMyCurrentPlaybackState('saveToMyLikedSongs');
  }

  async unsaveFromMyLikedSongs() {
    return await this.getMyCurrentPlaybackState('unsaveFromMyLikedSongs');
  }

  async playPause() {
    return await this.getMyCurrentPlaybackState('playPause');
  }

  async playTrack(trackUri) {
    return await this.spotifyWebApi.getMyDevices().then(
      (data) => {
        const availableDevices = data.body.devices;
        const activeDevice = this.selectActiveDevice(availableDevices);
        if (!activeDevice) {
          return {
            statusCode: 204,
            message: [{ error: 'No playback device available.' }],
            isSuccess: false
          };
        }
        return this.spotifyWebApi.play({
          device_id: { device_id: activeDevice },
          uris: [trackUri]
        }).then(
          () => {
            return {
              statusCode: 200,
              message: [{ desc: 'Playing track.' }],
              isSuccess: true
            };
          },
          (err) => {
            return this.handleError(err, () => {
              return this.playTrack(trackUri);
            });
          }
        );
      },
      (err) => {
        return this.handleError(err, () => {
          return this.playTrack(trackUri);
        });
      }
    );
  }
}

const spotifyWebAPI = new SpotifyWebAPI();
module.exports = spotifyWebAPI;
