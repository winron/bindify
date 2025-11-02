# Production Setup Guide

This guide explains how to configure Bindify for production deployment.

## Spotify OAuth Configuration

### 1. Update Spotify Developer Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Select your app
3. Click "Edit Settings"
4. Add the following redirect URIs:
   - **Development**: `http://localhost:1212/authorize`
   - **Production**: `bindify://authorize` (custom protocol)

### 2. Set Environment Variables

Create a `.env` file in the project root (or set environment variables):

```bash
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_production_client_id
SPOTIFY_CLIENT_SECRET=your_production_client_secret

# Server Configuration (optional - defaults provided)
SERVER_PORT=1212
SERVER_HOST=localhost

# Redirect URI (optional - auto-configured based on dev/prod)
# Development: http://localhost:1212/authorize
# Production: bindify://authorize
REDIRECT_URI=bindify://authorize

# Socket.IO URL (optional)
SOCKET_URL=http://localhost:1212
```

### 3. Custom Protocol Registration

The app uses `bindify://` as a custom protocol for OAuth redirects in production. This is automatically registered when the app is installed.

**For macOS:**
- The custom protocol is registered via `app.setAsDefaultProtocolClient('bindify')` in `main.js`
- It's also configured in `package.json` or `electron-builder.json` if building installers

**For Windows:**
- The custom protocol is registered during installation
- Make sure `electron-builder.json` includes protocol configuration if needed

### 4. Build for Production

```bash
# Build the React app and server
npm run react-build
npm run server-build

# Package the Electron app
npm run electron-pack
```

### 5. Testing Production Build

1. Install the packaged app
2. The custom protocol `bindify://` will be registered automatically
3. When users authorize with Spotify, they'll be redirected to `bindify://authorize?code=...`
4. The app will handle this protocol URL and complete the authorization

## Notes

- **Development**: Uses `http://localhost:1212/authorize` for local development
- **Production**: Uses `bindify://authorize` custom protocol (works without a web server)
- The local server (port 1212) still runs in production for Socket.IO communication
- Make sure to add both redirect URIs in Spotify Dashboard before switching

## Troubleshooting

If authorization fails in production:
1. Verify both redirect URIs are added in Spotify Dashboard
2. Check that the custom protocol is registered (should happen automatically on install)
3. Ensure `REDIRECT_URI` environment variable matches what's in Spotify Dashboard
4. Check browser/OS console for protocol handler errors

