import React from 'react';
import { X } from 'lucide-react';
import { SpotifyPlaylist, SpotifyTrack } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: SpotifyTrack | null;
  playlists: SpotifyPlaylist[];
  onAddToPlaylist: (playlistId: string, artistName: string, trackName: string) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onAddToPlaylist,
}) => {
  const handlePlaylistSelect = (playlistId: string) => {
    if (track) {
      onAddToPlaylist(playlistId, track.artistName, track.trackName);
      onClose();
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass rounded-spotify p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Track Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {track.albumArtUrl && (
              <img
                src={track.albumArtUrl}
                alt={`${track.trackName} album art`}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{track.trackName}</p>
              <p className="text-sm text-gray-600">{track.artistName}</p>
            </div>
          </div>
        </div>

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {playlists.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No playlists found</p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900">{playlist.name}</div>
                  {playlist.tracks && (
                    <div className="text-sm text-gray-500">{playlist.tracks.total} tracks</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
