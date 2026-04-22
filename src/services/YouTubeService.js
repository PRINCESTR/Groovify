import { YOUTUBE_API_KEY } from '../data/config';

class YouTubeService {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.searchCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  // Robust ISO 8601 duration parser
  parseISO8601Duration(duration) {
    if (!duration || typeof duration !== 'string') return 0;
    
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

    const cacheKey = query.toLowerCase().trim();
    if (this.searchCache.has(cacheKey)) {
      const { timestamp, data } = this.searchCache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTTL) return data;
    }

    try {
      const searchUrl = `${this.baseUrl}/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${this.apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        const reason = errorData.error?.errors?.[0]?.reason;
        
        if (searchResponse.status === 403 && reason === 'quotaExceeded') {
          console.error("YouTube Search Failed: Quota Exceeded. You have used your daily limit (10,000 units). Search will return tomorrow.");
          return { error: 'quotaExceeded', results: [] };
        }
        
        if (searchResponse.status === 403) {
          console.error("YouTube Search Failed: 403 Forbidden. This usually means the YouTube Data API v3 is not enabled for your API Key.");
        }
        return [];
      }
      
      const searchData = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) return [];

      const videoIds = searchData.items
        .filter(item => item.id && item.id.videoId)
        .map(item => item.id.videoId)
        .join(',');

      if (!videoIds) return [];

      const detailsUrl = `${this.baseUrl}/videos?part=contentDetails&id=${videoIds}&key=${this.apiKey}`;
      const detailsResponse = await fetch(detailsUrl);

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

      const results = searchData.items
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

      this.searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    } catch (error) {
      console.error('YouTube Search failed:', error);
      return [];
    }
  }
}

export default new YouTubeService();
