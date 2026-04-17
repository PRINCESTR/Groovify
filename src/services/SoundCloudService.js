import { SOUNDCLOUD_CLIENT_ID } from '../data/config';

// Mock data as fallback
const mockSoundCloudResults = [
  {
    id: 'sc-1',
    title: 'Midnight City',
    artist: 'M83',
    imageUrl: 'https://i1.sndcdn.com/artworks-000010531532-6s6f4p-t500x500.jpg',
    audioUrl: 'https://soundcloud.com/m83/midnight-city'
  },
  {
    id: 'sc-2',
    title: 'Starboy',
    artist: 'The Weeknd',
    imageUrl: 'https://i1.sndcdn.com/artworks-000183120613-2o4y9v-t500x500.jpg',
    audioUrl: 'https://soundcloud.com/theweeknd/starboy-feat-daft-punk'
  }
];

class SoundCloudService {
  constructor() {
    this.clientId = SOUNDCLOUD_CLIENT_ID;
    this.baseUrl = 'https://api.soundcloud.com';
  }

  async searchTracks(query) {
    if (!query) return [];

    try {
      const response = await fetch(`${this.baseUrl}/tracks?q=${encodeURIComponent(query)}&client_id=${this.clientId}&limit=12`);
      
      if (!response.ok) throw new Error('SoundCloud API error');
      
      const data = await response.json();
      return data.map(track => ({
        id: `sc-${track.id}`,
        title: track.title,
        artist: track.user.username,
        imageUrl: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : track.user.avatar_url,
        audioUrl: track.permalink_url,
        duration: Math.floor(track.duration / 1000)
      }));
    } catch (error) {
      console.warn('SoundCloud API failed, using mock fallback:', error);
      return mockSoundCloudResults.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) || 
        t.artist.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async fetchMetadata(url) {
    // Detect YouTube
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
        try {
            const response = await fetch(`https://noembed.com/embed?url=${url}`);
            const data = await response.json();
            return {
                id: `yt-${Date.now()}`,
                title: data.title || "YouTube Track",
                artist: data.author_name || "YouTube Creator",
                imageUrl: data.thumbnail_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500",
                audioUrl: url
            };
        } catch (e) {
            return {
                id: `yt-${Date.now()}`,
                title: "Imported YouTube Track",
                artist: "YouTube",
                imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500",
                audioUrl: url
            };
        }
    }

    // Detect SoundCloud permalink
    if (url.includes('soundcloud.com/')) {
        try {
            // SoundCloud resolve endpoint requires client_id
            const res = await fetch(`${this.baseUrl}/resolve?url=${url}&client_id=${this.clientId}`);
            if (!res.ok) throw new Error();
            const track = await res.json();
            return {
                id: `sc-${track.id}`,
                title: track.title,
                artist: track.user.username,
                imageUrl: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : track.user.avatar_url,
                audioUrl: url,
                duration: Math.floor(track.duration / 1000)
            };
        } catch (e) {
             return null;
        }
    }

    return null;
  }

  async getTrending() {
    try {
      const response = await fetch(`${this.baseUrl}/tracks?client_id=${this.clientId}&limit=12&order=created_at`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.map(track => ({
        id: `sc-${track.id}`,
        title: track.title,
        artist: track.user.username,
        imageUrl: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : track.user.avatar_url,
        audioUrl: track.permalink_url
      }));
    } catch (error) {
      return mockSoundCloudResults;
    }
  }
}

export default new SoundCloudService();
