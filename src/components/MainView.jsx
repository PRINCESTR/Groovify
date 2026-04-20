import { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search as SearchIcon, 
  Music, 
  Video,
  Trash2,
  ListMusic,
  Play
} from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import AlbumCard from './AlbumCard';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const SongCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 animate-pulse">
    <div className="aspect-square bg-white/10 rounded-lg mb-4" />
    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/2" />
  </div>
);

const MainView = () => {
  const { 
    searchTracks, 
    isSearching, 
    searchResults, 
    likedTracks, 
    playlists,
    removeTrackFromPlaylist
  } = useContext(PlayerContext);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

  const view = id ? 'playlist' : (location.pathname === '/search' ? 'search' : 'home');

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchTracks(query);
  };

  const filteredResults = useMemo(() => {
    const results = Array.isArray(searchResults) ? searchResults : [];
    if (selectedSource === 'all') return results;
    return results.filter(track => track && track.source && track.source.toLowerCase() === selectedSource);
  }, [searchResults, selectedSource]);

  const currentPlaylist = useMemo(() => {
    if (id === 'fav') return { name: 'Liked Songs', tracks: likedTracks || [] };
    if (!Array.isArray(playlists)) return null;
    return playlists.find(p => p && p.id === id);
  }, [id, playlists, likedTracks]);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="h-full flex-1 flex flex-col bg-gradient-to-b from-white/[0.05] to-groovify-dark rounded-xl overflow-hidden ml-0 md:ml-2 shadow-2xl relative border border-white/5">
      
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-neutral-900/50 pb-40">
        <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex gap-2">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition-all text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition-all text-white">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className={`relative transition-all duration-300 w-full max-w-[400px]`}>
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => navigate('/search')}
                placeholder="Search music..."
                className="w-full bg-[#242424] border-none rounded-full py-2.5 pl-10 pr-4 text-sm font-medium transition-all outline-none ring-1 ring-transparent focus:ring-white/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-groovify-green to-emerald-400 flex items-center justify-center text-black font-black text-sm cursor-pointer shadow-lg">
              P
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8 pb-4 pt-4">
          <AnimatePresence mode="wait">
            {view === 'home' && !searchQuery && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="relative h-48 md:h-80 rounded-2xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=1200" className="w-full h-full object-cover" alt="hero" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                    <h1 className="text-3xl md:text-6xl font-black text-white leading-none">Groovy Vibes</h1>
                    <p className="text-white/60 font-bold mt-2">Your personal music sanctuary</p>
                  </div>
                </div>
              </motion.div>
            )}

            {(view === 'search' || searchQuery) && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-black text-white">Results</h2>
                  <div className="flex gap-1 md:gap-2">
                    {['all', 'jamendo', 'youtube'].map((source) => (
                      <button
                        key={source}
                        onClick={() => setSelectedSource(source)}
                        className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all ${
                          selectedSource === source ? 'bg-white text-black' : 'bg-white/10 text-white'
                        }`}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid-container">
                  {isSearching ? (
                    Array(8).fill(0).map((_, i) => <SongCardSkeleton key={i} />)
                  ) : filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map(track => (
                      <motion.div key={track.id} variants={itemVariants} className="track-card">
                        <AlbumCard data={track} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center opacity-30 italic">No tracks found</div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'playlist' && currentPlaylist && (
              <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
                  <div className="w-48 h-48 rounded-xl bg-neutral-800 flex items-center justify-center shadow-2xl shrink-0">
                    <Music size={80} className="text-white/10" />
                  </div>
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-black uppercase text-groovify-green tracking-widest">Playlist</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mt-2 leading-none">{currentPlaylist.name}</h1>
                    <p className="text-white/60 font-bold mt-4">{(currentPlaylist.tracks || []).length} tracks</p>
                  </div>
                </div>

                <div className="grid-container">
                  {(currentPlaylist.tracks || []).map(track => (
                    <div key={track.id} className="relative group">
                      <AlbumCard data={track} />
                      {id !== 'fav' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(id, track.id); }}
                          className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainView;
