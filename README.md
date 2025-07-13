# Spotify Time Machine

A fun little weekend project I did with some vibecoding to allow me to easily see my recent listening history and directly add tracks to my playlists (both public and private) from the web interface. I built this instead of using something like Last.fm since they do not record songs played when part of a Spotify Jam.

RESTful API built with Python + Flask. Spotipy for Spotify API integration.

TypeScript + React for frontend. This was done mostly with Claude Sonnet 4 but I wanted to dip my toes into using TypeScript.

## Features

- **Browse Listening History**: View your recent Spotify streaming history in a clean, organized table format
- **Add to Playlists**: Easily add tracks from your listening history to any of your existing Spotify playlists with a single click
- **Smart Caching**: Intelligent track caching system to improve performance and reduce Spotify Web API calls
- **Responsive UI**: React TypeScript powered frontend

## Prerequisites

- Node.js 16+ and npm
- Python 3.6+
- A Spotify Developer Account
- Your Spotify streaming history data (JSON format)

## Setup

### 1. Spotify App Registration

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app
3. Note down your `Client ID` and `Client Secret`
4. Add `http://127.0.0.1:8888/callback` to your app's redirect URIs

### 2. Get Your Spotify Data

1. Request your Spotify data from [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Wait for the download (can take a few days)
3. Create a folder called `data/StreamingHistoryJSONS` in the project directory
4. Extract the JSON files and place all `StreamingHistory_music_X.json` files in the `data/StreamingHistoryJSONS` folder
   - The app will automatically detect and use the file with the most recent listening data

### 3. Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd spotify-time-machine
   ```

2. Install Python dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   cd spotify-time-machine
   npm install
   ```

### 4. Configuration

1. Copy the config template:
   ```bash
   cp config.ini.template config.ini
   ```

2. Edit `config.ini` with your Spotify credentials:
   ```ini
   [spotify]
   client_id = YOUR_CLIENT_ID
   client_secret = YOUR_CLIENT_SECRET
   redirect_uri = http://127.0.0.1:8888/callback
   ```

## Running the Application

### Method 1: Using npm scripts (Recommended)

1. Start frontend and backend:
   ```bash
   npm run backend

   npm run dev
   ```

### Method 2: Manual startup

1. Start backend:
   ```bash
   cd backend
   python app.py
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

## How to Use

1. Open your browser and go to `http://localhost:3000`

2. You'll be redirected to Spotify for authentication. Grant the required permissions.

> The app requests the following Spotify permissions:
>- `playlist-modify-public`: To add tracks to your public playlists
>- `playlist-read-private`: To read your private playlists 
>- `playlist-modify-private`: To add tracks to your private playlists

3. Once authenticated, you'll see your listening history displayed in a table format.

4. To add a track to a playlist:
   - Select a playlist from the dropdown next to any track
   - Click the "Add" button
   - The track will be added to your selected playlist

## File Structure

```
spotify-time-machine/
├── backend/                         # Flask API backend
│   ├── app.py                      # Main Flask application
│   └── requirements.txt            # Python dependencies
├── config/                          # Configuration files
│   ├── frontend/                   # Frontend configuration
│   │   ├── postcss.config.js      # PostCSS configuration
│   │   ├── tailwind.config.js     # Tailwind CSS configuration
│   │   ├── tsconfig.json          # TypeScript configuration
│   │   ├── tsconfig.node.json     # TypeScript Node configuration
│   │   └── vite.config.ts          # Vite build configuration
│   ├── config.ini                  # Spotify API credentials (create from template)
│   └── config.ini.template         # Template for configuration
├── data/                           # Data and cache files
│   ├── cache/                      # Cache directory
│   │   ├── .spotify_cache          # OAuth token cache (auto-generated)
│   │   └── track_cache.json        # Cached track IDs (auto-generated)
│   └── StreamingHistoryJSONS/      # Folder containing your Spotify streaming history files
│       ├── StreamingHistory_music_0.json
│       ├── StreamingHistory_music_1.json
│       └── StreamingHistory_music_X.json  # Additional history files as needed
├── scripts/                        # Setup and utility scripts
├── src/                           # React frontend source
│   ├── components/                # Reusable components
│   ├── contexts/                  # React contexts
│   ├── pages/                     # Page components
│   ├── services/                  # API services
│   ├── types/                     # TypeScript type definitions
│   └── index.css                  # Global styles
├── index.html                     # Main HTML file
└── package.json                   # Node.js dependencies
```

## Development Tips

- The frontend runs on `http://localhost:3000`
- The backend API runs on `http://localhost:8888`
- Vite proxy forwards `/api/*` requests to the backend
- Hot reloading is enabled for both frontend and backend in development