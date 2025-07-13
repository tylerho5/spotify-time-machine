import React, { useState } from 'react';
import { SpotifyTrack, SpotifyPlaylist } from '../types';
import { Plus } from 'lucide-react';

interface TrackTableProps {
  tracks: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
  onAddToPlaylist: (playlistId: string, artistName: string, trackName: string) => void;
}

const TrackTable: React.FC<TrackTableProps> = ({ tracks, playlists, onAddToPlaylist }) => {
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);

  const handleAddToPlaylist = async (
    playlistId: string,
    artistName: string,
    trackName: string
  ) => {
    const trackKey = `${artistName}-${trackName}`;
    setLoadingTrack(trackKey);
    
    try {
      await onAddToPlaylist(playlistId, artistName, trackName);
    } finally {
      setLoadingTrack(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="glass rounded-spotify overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Track
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Listened On
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider w-80">
                Add to Playlist
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tracks.map((track, index) => {
              const trackKey = `${track.artistName}-${track.trackName}`;
              const isLoading = loadingTrack === trackKey;

              return (
                <tr 
                  key={`${track.artistName}-${track.trackName}-${index}`}
                  className="hover:bg-blue-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {track.artistName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700">
                      {track.trackName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(track.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <select
                        className="flex-1 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm focus:border-spotify-green focus:outline-none focus:ring-2 focus:ring-spotify-green/20"
                        defaultValue=""
                        disabled={isLoading}
                      >
                        <option value="" disabled>Select playlist...</option>
                        {playlists.map((playlist) => (
                          <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const select = document.querySelector(`tr:nth-child(${index + 1}) select`) as HTMLSelectElement;
                          if (select?.value) {
                            handleAddToPlaylist(select.value, track.artistName, track.trackName);
                          }
                        }}
                        disabled={isLoading}
                        className="btn-spotify text-white px-4 py-2 rounded-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Add</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {tracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No listening history found.</p>
        </div>
      )}
    </div>
  );
};

export default TrackTable;
