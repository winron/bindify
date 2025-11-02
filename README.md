# Bindify

Control your Spotify playback with customizable keyboard shortcuts.

## Description

Bindify is an Electron desktop application that allows you to control your Spotify playback using customizable global keyboard shortcuts. Set up shortcuts for play/pause, save songs, unsave songs, and more - all while keeping Spotify in the background.

## Features

- 🎹 Global keyboard shortcuts (works system-wide)
- ⏯️ Play/pause control
- ❤️ Save/unsave tracks to your library
- 📜 History of played and saved tracks
- ⌨️ Customizable key bindings
- 🎨 Spotify-compliant UI design
- 🚀 Cross-platform support (macOS, Windows)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Spotify account with Premium subscription (for playback control)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/bindify.git
cd bindify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Spotify Client ID and Secret from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

4. Configure Spotify OAuth:
   - Add redirect URI `http://localhost:1212/authorize` for development
   - Add redirect URI `bindify://authorize` for production

## Development

```bash
# Start development mode (React + Node + Electron)
npm start

# Build React app only
npm run react-build

# Build Node server only
npm run server-build

# Package Electron app for distribution
npm run electron-pack
```

## Production Build

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for detailed production deployment instructions.

## Usage

1. Launch the application
2. Click "Login to Spotify" to authenticate
3. Navigate to "Shortcuts" to configure your keyboard bindings
4. Enable shortcuts by clicking the heart icon
5. Press your configured key combinations to control Spotify playback

## Project Structure

```
├── main.js                 # Electron main process
├── preload.js              # Preload script for IPC
├── config.js               # Configuration (dev/prod)
├── server/                 # Node.js server (OAuth callback)
├── src/renderer/           # React application
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Page components
│   ├── routes/             # Route definitions
│   └── classes/            # Business logic classes
└── public/                 # Static assets
```

## Technologies

- **Electron** - Desktop app framework
- **React** - UI library
- **Spotify Web API** - Music control
- **iohook/uiohook-napi** - Global keyboard shortcuts
- **Socket.IO** - Communication between processes
- **Styled Components** - CSS-in-JS styling

## License

[CC0 1.0 (Public Domain)](LICENSE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [electron-react-node-boilerplate](https://github.com/thatisuday/electron-react-node-boilerplate)
