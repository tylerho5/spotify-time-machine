import React, { useState, useEffect } from 'react';
import { Music, LogOut, RefreshCw } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { SpotifyTrack, SpotifyPlaylist } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import TrackTable from '../components/TrackTable';
import NotificationContainer from '../components/NotificationContainer';

const Home: React.FC = () => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const authenticated = await spotifyApi.checkAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        await loadData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyResponse, playlistsResponse] = await Promise.all([
        spotifyApi.getHistory(),
        spotifyApi.getPlaylists(),
      ]);

      if (historyResponse.success) {
        setTracks(historyResponse.data);
      } else {
        addNotification(historyResponse.error || 'Failed to load history', 'error');
      }

      if (playlistsResponse.success) {
        setPlaylists(playlistsResponse.data);
      } else {
        addNotification(playlistsResponse.error || 'Failed to load playlists', 'error');
      }
    } catch (error) {
      addNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const authUrl = await spotifyApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      addNotification('Failed to get auth URL', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await spotifyApi.logout();
      setIsAuthenticated(false);
      setTracks([]);
      setPlaylists([]);
      addNotification('Logged out successfully', 'info');
    } catch (error) {
      addNotification('Failed to logout', 'error');
    }
  };

  const handleAddToPlaylist = async (playlistId: string, artistName: string, trackName: string) => {
    try {
      const response = await spotifyApi.addToPlaylist(playlistId, artistName, trackName);
      if (response.success) {
        addNotification(`Successfully added "${trackName}" to playlist!`, 'success');
      } else {
        addNotification(response.error || 'Failed to add track', 'error');
      }
    } catch (error) {
      addNotification('Failed to add track to playlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-spotify p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-spotify-green" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-spotify p-8 text-center max-w-md">
          <Music className="w-16 h-16 mx-auto mb-6 text-spotify-green" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎵 Spotify Time Machine
          </h1>
          <p className="text-gray-600 mb-6">
            Discover your Spotify listening history and easily add tracks to your playlists.
          </p>
          <button
            onClick={handleLogin}
            className="btn-spotify text-white px-8 py-3 rounded-button font-semibold text-lg"
          >
            Connect with Spotify
          </button>
        </div>
        <NotificationContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-spotify p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8 text-spotify-green" />
              <h1 className="text-3xl font-bold text-gray-900">
                🎵 Spotify Time Machine
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-button transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <TrackTable
          tracks={tracks}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
        />
      </div>
      
      <NotificationContainer />
    </div>
  );
};

export default Home;
