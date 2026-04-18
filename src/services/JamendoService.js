import { JAMENDO_CLIENT_ID } from '../data/config';

class JamendoService {
  constructor() {
    this.clientId = JAMENDO_CLIENT_ID;
    this.baseUrl = 'https://api.jamendo.com/v3.0';
  }

  async searchTracks(query) {
    if (!query) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&search=${encodeURIComponent(query)}&limit=15&audioformat=mp32`
      );
      
      if (!response.ok) throw new Error('Jamendo API error');
      
      const data = await response.json();
      
      if (!data.results) return [];

      return data.results.map(track => ({
        id: `jam-${track.id}`,
        title: track.name,
        artist: track.artist_name,
        imageUrl: track.image || track.album_image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
        audioUrl: track.audio.replace('http:', 'https:'),
        duration: track.duration,
        source: 'Jamendo'
      }));
    } catch (error) {
      console.error('Jamendo Search failed:', error);
      return [];
    }
  }

  async getTrending() {
    try {
      // Fetch popular tracks (weekly popularity)
      const response = await fetch(
        `${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&order=popularity_week&limit=20&audioformat=mp32`
      );
      
      if (!response.ok) throw new Error('Jamendo Trending API error');
      
      const data = await response.json();
      
      if (!data.results) return [];

      return data.results.map(track => ({
        id: `jam-${track.id}`,
        title: track.name,
        artist: track.artist_name,
        imageUrl: track.image || track.album_image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
        audioUrl: track.audio.replace('http:', 'https:'),
        duration: track.duration,
        source: 'Jamendo'
      }));
    } catch (error) {
      console.error('Jamendo Trending failed:', error);
      return [];
    }
  }
}

export default new JamendoService();
