import { YOUTUBE_API_KEY } from '../data/config';

class YouTubeService {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Parse ISO 8601 duration string (e.g., PT3M4S) to seconds
  parseISO8601Duration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  async searchTracks(query) {
    if (!query || !this.apiKey) return [];

    try {
      // 1. Search for videos
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${this.apiKey}`
      );
      
      if (!searchResponse.ok) {
        const err = await searchResponse.json();
        console.warn('YouTube API search error:', err);
        return [];
      }
      
      const searchData = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) return [];

      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // 2. Fetch contentDetails to get durations
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=contentDetails&id=${videoIds}&key=${this.apiKey}`
      );

      const detailsData = await detailsResponse.json();
      const durationsMap = {};
      if (detailsData.items) {
        detailsData.items.forEach(item => {
          durationsMap[item.id] = this.parseISO8601Duration(item.contentDetails.duration);
        });
      }

      // 3. Map everything to unified track objects
      return searchData.items.map(item => ({
        id: `yt-${item.id.videoId}`,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        imageUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: durationsMap[item.id.videoId] || 0,
        source: 'YouTube'
      }));
    } catch (error) {
      console.error('YouTube Search failed:', error);
      return [];
    }
  }
}

export default new YouTubeService();
