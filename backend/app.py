import configparser
import json
import os
import glob
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
app.secret_key = os.urandom(24)

# --- Configuration ---
# Get the directory of the current script to build absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)  # Parent directory for config files
config_path = os.path.join(parent_dir, 'config', 'config.ini')

config = configparser.ConfigParser()
config.read(config_path)

SPOTIPY_CLIENT_ID = config.get('spotify', 'client_id', fallback=None)
SPOTIPY_CLIENT_SECRET = config.get('spotify', 'client_secret', fallback=None)
SPOTIPY_REDIRECT_URI = config.get('spotify', 'redirect_uri', fallback='http://localhost:3000/callback')
SCOPE = 'playlist-modify-public playlist-modify-private playlist-read-private'

# --- Caching ---
CACHE_PATH = os.path.join(parent_dir, "data", "cache", ".spotify_cache")
track_cache_path = os.path.join(parent_dir, 'data', 'cache', 'track_cache.json')

# Ensure cache directory exists
cache_dir = os.path.dirname(CACHE_PATH)
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

def load_track_cache():
    try:
        if os.path.exists(track_cache_path):
            with open(track_cache_path, 'r') as f:
                return json.load(f)
    except (IOError, json.JSONDecodeError):
        pass
    return {}

def save_track_cache(cache):
    with open(track_cache_path, 'w') as f:
        json.dump(cache, f, indent=4)

track_cache = load_track_cache()

# --- Core Logic ---
def find_most_recent_streaming_history():
    """
    Find the streaming history JSON file with the most recent endTime.
    """
    streaming_history_dir = os.path.join(parent_dir, 'data', 'StreamingHistoryJSONS')
    
    # Look for files matching the pattern StreamingHistory_music_X.json
    pattern = os.path.join(streaming_history_dir, 'StreamingHistory_music_*.json')
    json_files = glob.glob(pattern)
    
    if not json_files:
        # Fallback to the old location if no files found in data/StreamingHistoryJSONS
        fallback_file = os.path.join(parent_dir, 'StreamingHistory_music_1.json')
        if os.path.exists(fallback_file):
            return fallback_file
        return None
    
    most_recent_file = None
    most_recent_time = None
    
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data:  # Check if file has content
                    # Get the first item to check endTime
                    first_item = data[0]
                    if 'endTime' in first_item:
                        # Parse the endTime (format: "2023-12-31 23:59")
                        end_time = datetime.strptime(first_item['endTime'], "%Y-%m-%d %H:%M")
                        
                        if most_recent_time is None or end_time > most_recent_time:
                            most_recent_time = end_time
                            most_recent_file = file_path
        except (FileNotFoundError, json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error reading {file_path}: {e}")
            continue
    
    return most_recent_file

# --- Spotify Authentication ---
def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=SPOTIPY_CLIENT_ID,
        client_secret=SPOTIPY_CLIENT_SECRET,
        redirect_uri=SPOTIPY_REDIRECT_URI,
        scope=SCOPE,
        cache_path=CACHE_PATH,
        show_dialog=True
    )

def get_spotify_client():
    oauth = get_spotify_oauth()
    token_info = oauth.get_cached_token()
    
    if not token_info:
        return None, None

    if oauth.is_token_expired(token_info):
        token_info = oauth.refresh_access_token(token_info['refresh_token'])

    return spotipy.Spotify(auth=token_info['access_token']), token_info

# --- Track Search ---
def get_track_id(sp, artist, track_name):
    cache_key = f"{artist.lower()}|{track_name.lower()}"
    if cache_key in track_cache:
        return track_cache[cache_key]

    try:
        query = f"track:{track_name} artist:{artist}"
        results = sp.search(q=query, type='track', limit=1)
        if results['tracks']['items']:
            track_id = results['tracks']['items'][0]['id']
            track_cache[cache_key] = track_id
            save_track_cache(track_cache)
            return track_id
    except Exception as e:
        print(f"Error searching for track: {e}")

    track_cache[cache_key] = None # Cache failure to avoid retries
    save_track_cache(track_cache)
    return None

# --- API Routes ---
@app.route('/auth', methods=['GET'])
def get_auth_url():
    """Get Spotify authorization URL"""
    oauth = get_spotify_oauth()
    auth_url = oauth.get_authorize_url()
    return jsonify({'auth_url': auth_url})

@app.route('/auth/status', methods=['GET'])
def check_auth_status():
    """Check if user is authenticated"""
    sp, token_info = get_spotify_client()
    return jsonify({'authenticated': token_info is not None})

@app.route('/callback', methods=['POST'])
def callback():
    """Handle OAuth callback"""
    data = request.get_json()
    code = data.get('code')
    
    if not code:
        return jsonify({'success': False, 'error': 'No authorization code provided'}), 400
    
    try:
        oauth = get_spotify_oauth()
        token_info = oauth.get_access_token(code)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get user's listening history"""
    sp, token_info = get_spotify_client()
    if not token_info:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    try:
        # Find the most recent streaming history file
        most_recent_file = find_most_recent_streaming_history()
        
        if most_recent_file:
            with open(most_recent_file, 'r', encoding='utf-8') as f:
                all_history = json.load(f)
                # Read from the end backwards (most recent first) and limit to 200 items
                history = all_history[-200:] if len(all_history) > 200 else all_history
                # Reverse to show most recent first
                history.reverse()
        else:
            history = []

        return jsonify({'success': True, 'data': history})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/playlists', methods=['GET'])
def get_playlists():
    """Get user's playlists"""
    sp, token_info = get_spotify_client()
    if not token_info:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    try:
        user_playlists = sp.current_user_playlists()
        playlists = user_playlists.get('items', []) if user_playlists else []
        return jsonify({'success': True, 'data': playlists})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/add', methods=['POST'])
def add_to_playlist():
    """Add track to playlist"""
    sp, token_info = get_spotify_client()
    if not token_info:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    data = request.get_json()
    playlist_id = data.get('playlist_id')
    artist_name = data.get('artist_name')
    track_name = data.get('track_name')

    if not all([playlist_id, artist_name, track_name]):
        return jsonify({'success': False, 'error': 'Missing required data'}), 400

    try:
        track_id = get_track_id(sp, artist_name, track_name)
        
        if track_id:
            sp.playlist_add_items(playlist_id, [track_id])
            return jsonify({'success': True, 'data': f"Successfully added '{track_name}' to playlist!"})
        else:
            return jsonify({'success': False, 'error': f"Could not find Spotify ID for '{track_name}' by '{artist_name}'"})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        if os.path.exists(CACHE_PATH):
            os.remove(CACHE_PATH)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == "__main__":
    if not all([SPOTIPY_CLIENT_ID, SPOTIPY_CLIENT_SECRET, SPOTIPY_REDIRECT_URI]):
        print("CRITICAL: Spotify API credentials are not configured in config.ini")
    else:
        app.run(debug=True, port=8888)
