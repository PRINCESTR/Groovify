import { YOUTUBE_API_KEY } from '../data/config';

class YouTubeService {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async searchTracks(query) {
    if (!query || !this.apiKey) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        const err = await response.json();
        console.warn('YouTube API warning (Check Key):', err);
        return [];
      }
      
      const data = await response.json();
      
      if (!data.items) return [];

      return data.items.map(item => ({
        id: `yt-${item.id.videoId}`,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        imageUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: 0, // YouTube duration requires separate call, using 0 for now as ReactPlayer handles it
        source: 'YouTube'
      }));
    } catch (error) {
      console.error('YouTube Search failed:', error);
      return [];
    }
  }
}

export default new YouTubeService();
