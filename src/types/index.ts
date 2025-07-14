export interface SpotifyTrack {
  artistName: string;
  trackName: string;
  endTime: string;
  msPlayed?: number;
  albumArtUrl?: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  tracks?: {
    total: number;
  };
}

export interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}
