import React from 'react';
import { SpotifyTrack, SpotifyPlaylist } from '../types';
import { Plus } from 'lucide-react';

interface TrackTableProps {
  tracks: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
  onOpenPlaylistModal: (track: SpotifyTrack) => void;
}

const TrackTable: React.FC<TrackTableProps> = ({ tracks, playlists, onOpenPlaylistModal }) => {
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Listened On
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider w-20">
                Add
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tracks.map((track, index) => (
              <tr 
                key={`${track.artistName}-${track.trackName}-${index}`}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="text-gray-500 font-medium">
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {track.albumArtUrl ? (
                      <img
                        src={track.albumArtUrl}
                        alt={`${track.trackName} album art`}
                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">♪</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {track.trackName}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {track.artistName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(track.endTime)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenPlaylistModal(track)}
                    className="w-8 h-8 rounded-full bg-spotify-green hover:bg-green-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
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
