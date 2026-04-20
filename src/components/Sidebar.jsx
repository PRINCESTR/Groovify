import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, Music, ListMusic } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import ImportModal from './ImportModal';

const Sidebar = () => {
  const context = useContext(PlayerContext);
  const playlists = context?.playlists || [];
  const likedTracks = context?.likedTracks || [];
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <>
      <aside id="main-sidebar" className="w-[280px] flex-col gap-2 shrink-0 h-full hidden md:flex">
        <nav className="bg-neutral-900 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 text-sm font-black transition-all hover:text-white ${isActive ? 'text-white' : 'text-white/60'}`}>
            <Home size={28} strokeWidth={2.5} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `flex items-center gap-4 text-sm font-black transition-all hover:text-white ${isActive ? 'text-white' : 'text-white/60'}`}>
            <Search size={28} strokeWidth={2.5} />
            <span>Search</span>
          </NavLink>
        </nav>

        <div className="flex-1 bg-neutral-900 rounded-xl p-4 flex flex-col gap-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-4 text-white/60 hover:text-white transition-all font-black text-sm">
              <Library size={28} strokeWidth={2.5} />
              <span>Your Library</span>
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
            <div className="flex flex-col gap-2">
              <NavLink to="/playlist/fav" className="p-3 rounded-lg flex items-center gap-4 hover:bg-white/5 transition-all group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                  <Heart size={24} fill="white" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-black truncate">Liked Songs</span>
                  <span className="text-xs text-white/40 font-bold truncate">Playlist • {likedTracks.length} songs</span>
                </div>
              </NavLink>

              {playlists.filter(p => p && p.id !== 'fav').map(playlist => (
                <NavLink key={playlist.id} to={`/playlist/${playlist.id}`} className="p-3 rounded-lg flex items-center gap-4 hover:bg-white/5 transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                    <Music size={24} className="text-white/40" />
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-sm font-black truncate">{playlist.name}</span>
                    <span className="text-xs text-white/40 font-bold truncate">Playlist • {(playlist.tracks || []).length} songs</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav id="mobile-nav" className="fixed bottom-0 left-0 right-0 h-[75px] bg-black/95 backdrop-blur-xl border-t border-white/5 z-[100] flex md:hidden items-center justify-around px-2 pb-2">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-white/40'}`}>
          <Home size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-white/40'}`}>
          <Search size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Search</span>
        </NavLink>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <Plus size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Import</span>
        </button>
        <NavLink to="/playlist/fav" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-white/40'}`}>
          <Library size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Library</span>
        </NavLink>
      </nav>

      {isImportModalOpen && (
        <ImportModal 
            isOpen={isImportModalOpen} 
            onClose={() => setIsImportModalOpen(false)} 
            onImport={(url) => {
                // We'll use this placeholder or add a real import handler in PlayerProvider if needed
                console.log("Importing:", url);
                setIsImportModalOpen(false);
            }} 
        />
      )}
    </>
  );
};

export default Sidebar;
