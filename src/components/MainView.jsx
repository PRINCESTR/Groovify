import { useState, useContext, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search as SearchIcon, Heart, Play, Music, Trash2, ListMusic, RefreshCw } from 'lucide-react';
import { FaYoutube as Youtube } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import SoundCloudService from '../services/SoundCloudService';
import JamendoService from '../services/JamendoService';
import YouTubeService from '../services/YouTubeService';
import AlbumCard from './AlbumCard';
import { SongCardSkeleton } from './Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const MainView = ({ view }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'jamendo', 'youtube'
  const [trendingTracks, setTrendingTracks] = useState([]);
  
  const { 
    playSong, 
    playlists, 
    likedTracks, 
    recentTracks, 
    removeTrackFromPlaylist,
    deletePlaylist,
    toggleLike,
    isLiked,
    playbackError,
    setPlaybackError
  } = useContext(PlayerContext);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Multi-source Search Logic
  useEffect(() => {
    if (view !== 'search' || !searchQuery || searchQuery.startsWith('http')) {
        setSearchResults({ all: [], jamendo: [], youtube: [] });
        return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Fetch from all sources in parallel
        const [scResults, jamResults, ytResults] = await Promise.allSettled([
            SoundCloudService.searchTracks(searchQuery),
            JamendoService.searchTracks(searchQuery),
            YouTubeService.searchTracks(searchQuery)
        ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));
        
        // Combine results
        const combined = {
            all: [],
            jamendo: jamResults,
            youtube: ytResults
        };

        // Interleave for 'all' feed
        const maxLen = Math.max(scResults.length, jamResults.length, ytResults.length);
        for (let i = 0; i < maxLen; i++) {
            if (jamResults[i]) combined.all.push(jamResults[i]);
            if (ytResults[i]) combined.all.push(ytResults[i]);
            if (scResults[i]) combined.all.push(scResults[i]);
        }
        
        setSearchResults(combined);
      } catch (err) {
        console.error("Critical search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, view]);

  // Filtered Results based on tab
  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    if (selectedSource === 'all') return searchResults.all || [];
    return searchResults[selectedSource] || [];
  }, [searchResults, selectedSource]);

  // Fetch Trending Tracks for Home
  useEffect(() => {
    if (view === 'home' && trendingTracks.length === 0) {
        const fetchTrending = async () => {
            try {
                const results = await JamendoService.getTrending();
                setTrendingTracks(results);
            } catch (err) {
                console.error("Discovery failed:", err);
            }
        };
        fetchTrending();
    }
  }, [view, trendingTracks.length]);

  const handleSearchInput = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Auto-import links
    if (val.includes('youtube.com/') || val.includes('youtu.be/') || val.includes('soundcloud.com/')) {
        const metadata = await SoundCloudService.fetchMetadata(val);
        if (metadata) {
            playSong(metadata);
            setSearchQuery('');
        }
    }
  };

  const currentPlaylist = playlists.find(p => p.id === id);

  const moodCategories = [
    { name: 'Chill', color: 'from-blue-600 to-blue-900', query: 'lofi chill' },
    { name: 'Focus', color: 'from-purple-600 to-purple-900', query: 'coding focus' },
    { name: 'Party', color: 'from-pink-600 to-pink-900', query: 'dance party' },
    { name: 'Workout', color: 'from-orange-600 to-orange-900', query: 'gym motivation' }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white/[0.05] to-groovify-dark rounded-xl overflow-hidden ml-2 shadow-2xl relative border border-white/5">
      
      {/* Top Bar (Glassmorphic) */}
      <div className="h-16 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
            <input 
              type="text" 
              placeholder="Search or paste link..."
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => navigate('/search')}
              className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-black text-sm font-bold placeholder:text-black/40 outline-none focus:ring-4 focus:ring-groovify-green/20 border-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-black hover:scale-105 transition-transform active:scale-95 shadow-lg">
            PRO
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-groovify-green to-emerald-400 flex items-center justify-center text-black font-black text-sm cursor-pointer shadow-lg hover:rotate-12 transition-transform">
            P
          </div>
        </div>
      </div>

      {/* Scrollable Content Zone */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 pt-6 scroll-smooth scrollbar-hide">
        <AnimatePresence mode="wait">
          {view === 'home' && !searchQuery && (
            <motion.div 
              key="home"
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">
                {getGreeting()}
              </h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                {moodCategories.map((mood) => (
                    <motion.div
                        key={mood.name}
                        onClick={() => { setSearchQuery(mood.query); navigate('/search'); }}
                        className={`bg-gradient-to-br ${mood.color} h-28 rounded-xl p-5 cursor-pointer hover:scale-[1.03] transition-all relative overflow-hidden group shadow-xl`}
                        whileHover={{ y: -5 }}
                    >
                        <span className="text-2xl font-black text-white relative z-10 tracking-tight">{mood.name}</span>
                        <Play className="absolute bottom-3 right-3 text-white/20 group-hover:text-white/80 group-hover:scale-110 transition-all" size={44} fill="white" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
              </div>

              {recentTracks.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 bg-groovify-green rounded-full shadow-[0_0_15px_#1db954]" />
                        <h2 className="text-2xl font-black text-white tracking-tight">Recently Played</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {recentTracks.slice(0, 6).map(track => (
                            <motion.div key={`recent-${track.id}`} variants={itemVariants}>
                                <AlbumCard data={track} />
                            </motion.div>
                        ))}
                    </div>
                </section>
              )}

              <section className="mb-12">
                <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                    <Music className="text-groovify-green drop-shadow-[0_0_8px_#1db954]" />
                    Discovery & Trending
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {(trendingTracks.length > 0 ? trendingTracks : []).map(track => (
                    <motion.div key={track.id} variants={itemVariants}>
                      <AlbumCard data={track} />
                    </motion.div>
                  ))}
                  {trendingTracks.length === 0 && Array(6).fill(0).map((_, i) => <SongCardSkeleton key={i} />)}
                </div>
              </section>
            </motion.div>
          )}

          {(view === 'search' || searchQuery) && (
            <motion.div 
              key="search"
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tighter flex items-center gap-4">
                        {isSearching && <RefreshCw size={32} className="text-groovify-green animate-spin" />}
                        {isSearching ? 'Searching multiple sources...' : searchQuery ? `Results: ${searchQuery}` : 'Explore'}
                    </h2>
                    
                    {/* Source Tabs */}
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'all', label: 'All Sources', icon: <SearchIcon size={14} /> },
                            { id: 'jamendo', label: 'Jamendo Music', icon: <Music size={14} /> },
                            { id: 'youtube', label: 'YouTube Video', icon: <Youtube size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedSource(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all
                                    ${selectedSource === tab.id 
                                        ? 'bg-white text-black shadow-lg scale-105' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-groovify-green/5 to-transparent pointer-events-none" />
              </div>

              {/* Playback Error Alert */}
              <AnimatePresence>
                {playbackError && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between font-bold text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <SearchIcon size={16} />
                            </div>
                            {playbackError}
                        </div>
                        <button 
                            onClick={() => setPlaybackError(null)}
                            className="text-red-400/60 hover:text-red-400"
                        >
                            Dismiss
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {isSearching ? (
                    Array(12).fill(0).map((_, i) => <SongCardSkeleton key={i} />)
                ) : filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map(track => (
                        <motion.div key={track.id} variants={itemVariants}>
                            <AlbumCard data={track} />
                        </motion.div>
                    ))
                ) : searchQuery ? (
                   <div className="col-span-full py-32 flex flex-col items-center justify-center text-groovify-text-sub text-center opacity-50">
                        <SearchIcon size={64} className="mb-4" />
                        <p className="text-xl font-black">No matches found in {selectedSource}</p>
                        <p className="font-bold">Try searching for a specific artist or switching tabs</p>
                   </div>
                ) : (
                    <div className="col-span-full text-center py-20 text-white/20">
                        <Music size={80} className="mx-auto mb-4 opacity-10" />
                        <p className="text-xl font-black uppercase tracking-widest italic">Start your discovery journey...</p>
                    </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'library' && !searchQuery && (
            <motion.div 
              key="library"
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-6 mb-10 bg-gradient-to-r from-purple-900/40 to-indigo-900/10 p-10 rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                    <Heart size={64} fill="white" className="text-white drop-shadow-lg" />
                </div>
                <div className="relative z-10">
                   <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">Liked Songs</h1>
                   <p className="text-groovify-text-sub font-black text-lg opacity-60 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-groovify-green shadow-[0_0_8px_#1db954]" />
                        {likedTracks.length} tracks
                   </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {likedTracks.length > 0 ? (
                    likedTracks.map(track => (
                        <motion.div key={`liked-${track.id}`} variants={itemVariants}>
                            <AlbumCard data={track} />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-groovify-text-sub opacity-30 text-center">
                        <Music size={80} strokeWidth={1} className="mb-6" />
                        <p className="text-2xl font-black mb-2">Your library is empty</p>
                        <p className="font-bold">Start liking songs to see them here</p>
                    </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'playlist' && currentPlaylist && !searchQuery && (
            <motion.div 
              key={`playlist-${id}`}
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-6 mb-10 bg-gradient-to-r from-emerald-900/40 to-groovify-dark p-10 rounded-2xl border border-white/5 shadow-2xl relative">
                <div className="w-32 h-32 bg-white/10 rounded-xl flex items-center justify-center shadow-2xl border border-white/10 group overflow-hidden">
                    <Music size={64} className="text-white/40 group-hover:text-groovify-green transition-colors" />
                </div>
                <div className="flex-1">
                   <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black text-groovify-green uppercase tracking-widest mb-1">Playlist</p>
                            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">{currentPlaylist.name}</h1>
                            <p className="text-groovify-text-sub font-bold opacity-60 flex items-center gap-2 italic">
                                Built for discovery • {currentPlaylist.tracks.length} tracks
                            </p>
                        </div>
                        <button 
                            onClick={() => { deletePlaylist(id); navigate('/'); }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-full transition-all flex items-center gap-2 font-bold mb-4"
                        >
                            <Trash2 size={20} />
                        </button>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {currentPlaylist.tracks.length > 0 ? (
                    currentPlaylist.tracks.map(track => (
                        <motion.div key={`pl-track-${track.id}`} variants={itemVariants} className="relative group">
                            <AlbumCard data={track} />
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(id, track.id); }}
                                className="absolute top-2 left-2 p-1.5 bg-black/60 text-white/40 opacity-0 group-hover:opacity-100 rounded-full hover:text-red-500 transition-all z-20"
                            >
                                <Trash2 size={12} />
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-groovify-text-sub opacity-30 text-center">
                        <ListMusic size={80} strokeWidth={1} className="mb-6" />
                        <p className="text-2xl font-black mb-2">This playlist is empty</p>
                        <p className="font-bold">Add tracks from Album Menus or Search results</p>
                    </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default MainView;
