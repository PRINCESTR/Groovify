import { YOUTUBE_API_KEY } from '../data/config';

class YouTubeService {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Robust ISO 8601 duration parser
  parseISO8601Duration(duration) {
    if (!duration || typeof duration !== 'string') return 0;
    
    //PT1H2M3S, P1DT2H, etc
    try {
      const match = duration.match(/PT?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      
      const days = parseInt(match[1] || '0', 10);
      const hours = parseInt(match[2] || '0', 10);
      const minutes = parseInt(match[3] || '0', 10);
      const seconds = parseInt(match[4] || '0', 10);
      
      return (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
    } catch (e) {
      return 0;
    }
  }

  async searchTracks(query) {
    if (!query || !this.apiKey) return [];

    try {
      const searchUrl = `${this.baseUrl}/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${this.apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) return [];
      
      const searchData = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) return [];

      const videoIds = searchData.items
        .filter(item => item.id && item.id.videoId)
        .map(item => item.id.videoId)
        .join(',');

      if (!videoIds) return [];

      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=contentDetails&id=${videoIds}&key=${this.apiKey}`
      );

      const durationsMap = {};
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        if (detailsData.items) {
          detailsData.items.forEach(item => {
            if (item?.contentDetails?.duration) {
              durationsMap[item.id] = this.parseISO8601Duration(item.contentDetails.duration);
            }
          });
        }
      }

      return searchData.items
        .filter(item => item.id && item.id.videoId)
        .map(item => ({
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
