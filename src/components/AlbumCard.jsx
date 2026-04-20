import { useContext, useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, MoreVertical, Heart, Music } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const AlbumCard = memo(({ data }) => {
  const { playSong, currentSong, isPlaying, togglePlay, playlists, addTrackToPlaylist, toggleLike, isLiked } = useContext(PlayerContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const isThisPlaying = currentSong?.id === data.id;
  const isPlayingCurrent = isThisPlaying && isPlaying;
  const liked = isLiked(data.id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isThisPlaying) {
      togglePlay();
    } else {
      playSong(data);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 shadow-lg cursor-pointer flex flex-col h-full relative"
      onClick={() => playSong(data)}
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-2xl">
        <img 
          src={data.imageUrl} 
          alt={data.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Play Overlay */}
        <div className={`absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ${isThisPlaying ? 'opacity-100 translate-y-0' : ''}`}>
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-groovify-green flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all text-black"
          >
            {isPlayingCurrent ? (
              <Pause fill="black" size={24} />
            ) : (
              <Play fill="black" size={24} className="ml-1" />
            )}
          </button>
        </div>

        {/* EQ Animation when playing */}
        {isPlayingCurrent && (
          <div className="absolute top-2 left-2 flex items-end gap-0.5 h-6 opacity-80 backdrop-blur-md bg-black/40 p-1 rounded">
            <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-groovify-green rounded-full" />
            <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-groovify-green rounded-full" />
            <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-groovify-green rounded-full" />
          </div>
        )}

        {/* Menu Toggle */}
        <button 
           onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
           className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
        >
            <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex flex-col flex-1 gap-1">
        <h3 className="text-white font-black text-base truncate pr-6">{data.title}</h3>
        <p className="text-white/40 font-bold text-sm truncate">{data.artist}</p>
      </div>
      
      {/* Source Badge */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5 text-white/40 uppercase tracking-tighter">
            {data.source}
        </span>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-12 right-4 w-56 bg-[#181818] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 flex flex-col gap-0.5">
                <button 
                    onClick={() => { toggleLike(data); setShowMenu(false); }}
                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/10 text-sm font-bold text-white/60 hover:text-white transition-colors text-left"
                >
                    <Heart size={16} className={liked ? 'text-groovify-green fill-groovify-green' : ''} />
                    {liked ? 'Remove from Liked' : 'Add to Liked'}
                </button>
                <div className="h-px bg-white/5 my-1" />
                <p className="px-2.5 py-1 text-[10px] font-black text-white/30 uppercase tracking-widest">Add to Playlist</p>
                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {playlists.filter(p => p.id !== 'fav').map(p => (
                        <button 
                            key={p.id}
                            onClick={() => { addTrackToPlaylist(p.id, data); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/10 text-sm font-bold text-white/60 hover:text-white transition-colors text-left"
                        >
                            <Music size={16} />
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AlbumCard.displayName = 'AlbumCard';

export default AlbumCard;
