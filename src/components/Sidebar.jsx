import { Home, Search, Library, Plus, Heart, Music, Trash2, Link } from 'lucide-react';
import { FaYoutube as Youtube } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useMemo, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import ImportModal from './ImportModal';
import SoundCloudService from '../services/SoundCloudService';

const Sidebar = () => {
  const context = useContext(PlayerContext);
  const navigate = useNavigate();
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Hardened safety guard
  if (!context) {
    return (
      <div className="w-[280px] h-full bg-black/40 border-r border-white/5 flex items-center justify-center p-4">
        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Context Unavailable</p>
      </div>
    );
  }

  const { playlists, createPlaylist, deletePlaylist, playSong, recentTracks } = context;

  const handleImport = async (url) => {
    const metadata = await SoundCloudService.fetchMetadata(url);
    if (metadata) {
        playSong(metadata);
        navigate('/');
    }
  };

  const handleCreatePlaylist = () => {
    try {
      const newPlaylist = createPlaylist();
      if (newPlaylist && newPlaylist.id) {
        navigate(`/playlist/${newPlaylist.id}`);
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  const likedTracksCount = useMemo(() => {
    if (!playlists || !Array.isArray(playlists)) return 0;
    return (playlists || []).find(p => p && p.id === 'fav')?.tracks?.length || 0;
  }, [playlists]);

  const navItems = [
    { name: 'Home', icon: Home, to: '/' },
    { name: 'Search', icon: Search, to: '/search' },
  ];

  return (
    <div className="w-[280px] h-full flex flex-col p-2 gap-2 bg-black backdrop-blur-2xl border-r border-white/5 font-sans z-50">
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImport={handleImport} 
      />

      {/* Top Nav Block */}
      <div className="bg-groovify-dark/40 rounded-xl px-4 py-5 flex flex-col gap-6 border border-white/5 shadow-2xl overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon || Music;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 text-sm font-black tracking-tight transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-groovify-text-sub hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={isActive ? 3 : 2.5} className={isActive ? 'text-groovify-green drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]' : ''} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}

        <button 
           onClick={() => setIsImportOpen(true)}
           className="flex items-center gap-4 text-sm font-black text-groovify-text-sub hover:text-white transition-all duration-300 group tracking-tight"
        >
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-groovify-green transition-all shadow-lg">
                <Youtube size={14} className="group-hover:text-black" />
            </div>
            Import YouTube
        </button>
      </div>

      {/* Library Block */}
      <div className="bg-groovify-dark/40 rounded-xl flex-1 flex flex-col overflow-hidden border border-white/5 shadow-2xl">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between text-groovify-text-sub">
          <NavLink 
            to="/library"
            className={({ isActive }) => 
              `flex items-center gap-3 text-base font-black transition-colors duration-200 ${
                isActive ? 'text-white' : 'hover:text-white'
              }`
            }
          >
            <Library size={24} strokeWidth={2.5} className="group-hover:text-white" />
            Your Library
          </NavLink>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCreatePlaylist}
            className="hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        </div>

        {/* Categories/Shortcuts */}
        <div className="px-2 mt-2 space-y-1">
            <NavLink 
                to="/library" 
                className={({ isActive }) => 
                    `flex items-center gap-3 p-3 rounded-lg text-sm font-black tracking-tight transition-all duration-300 ${
                        isActive ? 'bg-white/10 text-white shadow-lg' : 'text-groovify-text-sub hover:bg-white/5 hover:text-white'
                    }`
                }
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-500 flex items-center justify-center shadow-xl">
                    <Heart size={16} fill="white" className="text-white drop-shadow-md" />
                </div>
                Liked Songs
                {likedTracksCount > 0 && (
                    <span className="ml-auto text-[10px] bg-groovify-green/20 text-groovify-green px-2 py-0.5 rounded-full font-black">
                        {likedTracksCount}
                    </span>
                )}
            </NavLink>
        </div>

        {/* Dynamic Playlists */}
        <div className="flex-1 overflow-y-auto px-2 py-4 border-t border-white/10 mt-3 scrollbar-hide">
          <div className="flex flex-col gap-1">
            <AnimatePresence>
                {Array.isArray(playlists) && playlists.filter(p => p && p.id !== 'fav').map((playlist) => (
                <motion.div 
                    key={playlist.id} 
                    className="group relative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                >
                    <NavLink 
                        to={`/playlist/${playlist.id}`}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                                isActive ? 'bg-white/10 text-white shadow-lg' : 'text-groovify-text-sub hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-groovify-green/10 transition-colors shadow-inner">
                            <Music size={16} className="text-groovify-text-sub group-hover:text-groovify-green transition-colors" />
                        </div>
                        <span className="text-sm font-black truncate pr-6 tracking-tight">{playlist.name}</span>
                    </NavLink>
                    <button 
                        onClick={(e) => { e.preventDefault(); deletePlaylist(playlist.id); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-groovify-text-sub"
                    >
                        <Trash2 size={14} />
                    </button>
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
