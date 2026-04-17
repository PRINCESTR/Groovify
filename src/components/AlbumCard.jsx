import { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MoreVertical, Plus, Heart, Music, ListPlus } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const AlbumCard = ({ data }) => {
  const { playSong, currentSong, isPlaying, togglePlay, playlists, addTrackToPlaylist, toggleLike, isLiked } = useContext(PlayerContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const isThisPlaying = currentSong?.id === data.id;

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

  const liked = isLiked(data.id);

  return (
    <motion.div 
      className="group flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all duration-300 cursor-pointer relative"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl shadow-black/60">
        <img 
          src={data.imageUrl || 'https://images.unsplash.com/photo-1514525253361-bee8a48700ef?w=300'} 
          alt={data.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Play Button Overlay */}
        <motion.button 
          onClick={handlePlayClick}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full bg-groovify-green flex items-center justify-center text-black shadow-2xl
            ${isThisPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}
            transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-110 hover:bg-groovify-green-hover
          `}
        >
          {isThisPlaying && isPlaying ? (
            <div className="flex gap-1.5 h-6 items-center">
              <motion.div animate={{ height: [12, 24, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-black rounded-full" />
              <motion.div animate={{ height: [24, 12, 24] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-black rounded-full" />
              <motion.div animate={{ height: [16, 20, 16] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-black rounded-full" />
            </div>
          ) : (
            <Play fill="black" size={24} className="ml-1" />
          )}
        </motion.button>

        {/* Action Menu Button */}
        <button 
           onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
           className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-black/60"
        >
            <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-black text-base truncate tracking-tight flex-1">{data.title}</h3>
            {data.source && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white/40 uppercase tracking-tighter">
                    {data.source}
                </span>
            )}
        </div>
        <p className="text-groovify-text-sub font-bold text-[13px] line-clamp-1 opacity-70">
          {data.artist || data.description || "Unknown Artist"}
        </p>
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
                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/10 text-sm font-bold text-groovify-text-sub hover:text-white transition-colors"
                >
                    <Heart size={16} className={liked ? 'text-groovify-green' : ''} fill={liked ? 'currentColor' : 'none'} />
                    {liked ? 'Remove from Liked' : 'Add to Liked'}
                </button>
                <div className="h-px bg-white/5 my-1" />
                <p className="px-2.5 py-1 text-[10px] font-black text-white/30 uppercase tracking-widest">Add to Playlist</p>
                <div className="max-h-40 overflow-y-auto">
                    {playlists.filter(p => p.id !== 'fav').map(p => (
                        <button 
                            key={p.id}
                            onClick={() => { addTrackToPlaylist(p.id, data); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/10 text-sm font-bold text-groovify-text-sub hover:text-white transition-colors"
                        >
                            <Music size={16} />
                            {p.name}
                        </button>
                    ))}
                    {playlists.length <= 1 && (
                        <p className="px-3 py-4 text-xs italic text-white/20 text-center">No playlists found</p>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlbumCard;
