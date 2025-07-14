import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, LogOut, RefreshCw } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { SpotifyTrack, SpotifyPlaylist } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import TrackTable from '../components/TrackTable';
import PlaylistModal from '../components/PlaylistModal';
import NotificationContainer from '../components/NotificationContainer';

const Home: React.FC = () => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotification();
  
  // Refs for infinite scrolling
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tracksRef = useRef<SpotifyTrack[]>([]);
  const loadingMoreRef = useRef(false);
  const hasMoreTracksRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasMoreTracksRef.current = hasMoreTracks;
  }, [hasMoreTracks]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const loadMoreTracks = useCallback(async () => {
    if (loadingMoreRef.current || tracksRef.current.length === 0 || !hasMoreTracksRef.current) return;

    try {
      setLoadingMore(true);
      
      const lastTrack = tracksRef.current[tracksRef.current.length - 1];
      const beforeTimestamp = convertToUnixTimestamp(lastTrack.endTime);
      
      const response = await spotifyApi.getHistory(beforeTimestamp);
      
      if (response.success) {
        if (response.data.length > 0) {
          setTracks(prevTracks => [...prevTracks, ...response.data]);
        } else {
          setHasMoreTracks(false);
        }
      } else {
        addNotification('Failed to load more tracks', 'error');
      }
    } catch (error) {
      addNotification('Failed to load more tracks', 'error');
    } finally {
      setLoadingMore(false);
    }
  }, [addNotification]); // Removed hasMoreTracks from dependencies since we use the ref

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || !isAuthenticated) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && !loadingMoreRef.current && tracksRef.current.length > 0 && hasMoreTracksRef.current) {
        loadMoreTracks();
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isAuthenticated, loadMoreTracks]); // Only depend on isAuthenticated and loadMoreTracks

  const checkAuthAndLoadData = async () => {
    try {
      const authenticated = await spotifyApi.checkAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        await loadInitialData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setHasMoreTracks(true); // Reset the flag when loading initial data
      
      // Load playlists and initial tracks (100 tracks - 2 batches of 50)
      const [playlistsResponse, firstBatch] = await Promise.all([
        spotifyApi.getPlaylists(),
        spotifyApi.getHistory(),
      ]);

      if (playlistsResponse.success) {
        setPlaylists(playlistsResponse.data);
      } else {
        addNotification(playlistsResponse.error || 'Failed to load playlists', 'error');
      }

      let allTracks: SpotifyTrack[] = [];
      
      if (firstBatch.success && firstBatch.data.length > 0) {
        allTracks = [...firstBatch.data];
        
        // Load second batch if we got 50 tracks (indicating there might be more)
        if (firstBatch.data.length === 50) {
          const lastTrack = firstBatch.data[firstBatch.data.length - 1];
          const beforeTimestamp = convertToUnixTimestamp(lastTrack.endTime);
          
          const secondBatch = await spotifyApi.getHistory(beforeTimestamp);
          if (secondBatch.success) {
            allTracks = [...allTracks, ...secondBatch.data];
          }
        }
        
        setTracks(allTracks);
      } else {
        addNotification(firstBatch.error || 'Failed to load history', 'error');
      }
    } catch (error) {
      addNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const convertToUnixTimestamp = (isoString: string): number => {
    return new Date(isoString).getTime();
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

  const handleOpenPlaylistModal = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleClosePlaylistModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  const handleAddToPlaylist = async (playlistId: string, artistName: string, trackName: string) => {
    try {
      const response = await spotifyApi.addToPlaylist(playlistId, artistName, trackName);
      if (response.success) {
        const playlist = playlists.find(p => p.id === playlistId);
        const playlistName = playlist ? playlist.name : 'playlist';
        addNotification(`Successfully added "${trackName}" to ${playlistName}!`, 'success');
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
            Spotify Time Machine
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
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 p-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-spotify p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className="w-8 h-8 text-spotify-green" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Spotify Time Machine
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadInitialData}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-6">
        <div className="max-w-7xl mx-auto">
          <TrackTable
            tracks={tracks}
            playlists={playlists}
            onOpenPlaylistModal={handleOpenPlaylistModal}
          />
          
          {/* Loading indicator for infinite scroll */}
          {loadingMore && hasMoreTracks && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-spotify-green" />
              <p className="text-gray-600 mt-2">Loading more tracks...</p>
            </div>
          )}
          
          {/* End of tracks indicator */}
          {!hasMoreTracks && tracks.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">That's all your tracks! 🎵</p>
            </div>
          )}
          
          {/* Intersection observer sentinel */}
          <div ref={sentinelRef} className="h-4 opacity-0" />
        </div>
      </div>
      
      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={isModalOpen}
        onClose={handleClosePlaylistModal}
        track={selectedTrack}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
      />
      
      <NotificationContainer />
    </div>
  );
};

export default Home;
