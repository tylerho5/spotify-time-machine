import axios from 'axios';
import { SpotifyTrack, SpotifyPlaylist, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const spotifyApi = {
  // Get listening history
  getHistory: async (before?: number): Promise<ApiResponse<SpotifyTrack[]>> => {
    try {
      const params = before ? { before: before.toString() } : {};
      const response = await api.get('/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Get user playlists
  getPlaylists: async (): Promise<ApiResponse<SpotifyPlaylist[]>> => {
    try {
      const response = await api.get('/playlists');
      return response.data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  },

  // Add track to playlist
  addToPlaylist: async (playlistId: string, artistName: string, trackName: string): Promise<ApiResponse<string>> => {
    try {
      const response = await api.post('/add', {
        playlist_id: playlistId,
        artist_name: artistName,
        track_name: trackName,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to playlist:', error);
      throw error;
    }
  },

  // Get auth URL
  getAuthUrl: async (): Promise<string> => {
    try {
      const response = await api.get('/auth');
      return response.data.auth_url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  },

  // Check auth status
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/status');
      return response.data.authenticated;
    } catch (error) {
      return false;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
};
