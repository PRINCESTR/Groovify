import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  ListMusic,
  ChevronDown,
  RefreshCw,
  Home,
  Search,
  Library
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import QueuePanel from './QueuePanel';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seekTo,
    isLiked,
    toggleLike,
    isBuffering
  } = useContext(PlayerContext);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500
            ${isFullScreen ? 'h-full top-0 md:h-[var(--player-height)] md:top-auto' : 'h-[var(--mobile-nav-height)] md:h-[var(--player-height)] mb-[var(--mobile-nav-height)] md:mb-0'}
          `}
        >
          {/* Main Player Backdrop */}
          <div className={`h-full w-full bg-black/95 backdrop-blur-2xl border-t border-white/5 md:px-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)]
            ${isFullScreen ? 'p-8 pb-32 md:p-0' : 'px-2'}
          `}>
            
            {/* Left Section: Song Info */}
            <div 
              onClick={() => !isFullScreen && window.innerWidth <= 768 && setIsFullScreen(true)}
              className="flex items-center gap-4 md:w-[30%] cursor-pointer md:cursor-default"
            >
              <div className={`relative shrink-0 overflow-hidden shadow-2xl transition-all duration-500
                ${isFullScreen ? 'w-full aspect-square max-w-[350px] rounded-2xl mx-auto mb-8 mt-12 md:w-14 md:h-14 md:rounded-md md:m-0' : 'w-12 h-12 rounded-md'}
              `}>
                <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                {isBuffering && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <RefreshCw className="text-white animate-spin" size={20} />
                  </div>
                )}
              </div>
              
              <div className={`flex flex-col overflow-hidden ${isFullScreen ? 'items-center text-center md:items-start md:text-left' : ''}`}>
                <h4 className={`text-white font-black truncate hover:underline cursor-pointer transition-all
                  ${isFullScreen ? 'text-2xl md:text-sm mb-2 md:mb-0' : 'text-sm'}
                `}>
                  {currentSong.title}
                </h4>
                <p className={`text-white/60 font-bold truncate hover:text-white transition-colors
                  ${isFullScreen ? 'text-lg md:text-xs' : 'text-xs'}
                `}>
                  {currentSong.artist} • {currentSong.source}
                </p>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }}
                className={`transition-all hover:scale-110 active:scale-95 ${isFullScreen ? 'md:ml-2' : 'ml-auto md:ml-2'}`}
              >
                <Heart size={20} className={isLiked(currentSong.id) ? "text-zwp-green fill-zwp-green" : "text-white/40 hover:text-white"} />
              </button>
            </div>

            {/* Middle Section: Controls */}
            <div className={`max-w-[722px] md:w-[40%] flex flex-col items-center gap-2 transition-all
              ${isFullScreen ? 'flex-1 justify-center md:justify-start mt-8' : 'hidden md:flex'}
            `}>
              <div className="flex items-center gap-6">
                <Shuffle size={20} className="text-white/30 hover:text-white cursor-pointer hide-on-mobile" />
                <SkipBack size={28} fill="white" onClick={playPrevious} className="text-white hover:scale-110 transition-all cursor-pointer" />
                
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  {isPlaying ? (
                    <Pause size={24} fill="black" className="text-black" />
                  ) : (
                    <Play size={24} fill="black" className="text-black ml-1" />
                  )}
                </button>
                
                <SkipForward size={28} fill="white" onClick={playNext} className="text-white hover:scale-110 transition-all cursor-pointer" />
                <Repeat size={20} className="text-white/30 hover:text-white cursor-pointer hide-on-mobile" />
              </div>
              
              <div className="w-full flex items-center gap-3">
                <span className="text-[11px] font-black text-white/40 min-w-[40px] text-right">
                  {formatTime(currentTime)}
                </span>
                <div 
                  onClick={handleProgressClick}
                  className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-zwp-green rounded-full group-hover:bg-emerald-400" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-white/40 min-w-[40px]">
                  {duration > 0 ? formatTime(duration) : 'Stream'}
                </span>
              </div>
            </div>

            {/* Right Section: Volume & Mini-Controls */}
            <div className={`md:w-[30%] flex items-center justify-end gap-4
              ${isFullScreen ? 'mt-8 md:m-0 w-full justify-center md:justify-end' : 'md:flex'}
            `}>
              {isFullScreen && (
                <button 
                  onClick={() => setIsFullScreen(false)} 
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 md:hidden absolute top-8 left-8"
                >
                  <ChevronDown size={28} />
                </button>
              )}

              <div className="hidden md:flex items-center gap-3 group">
                 {volume === 0 ? <VolumeX size={20} onClick={() => setVolume(0.8)} /> : <Volume2 size={20} onClick={() => setVolume(0)} />}
                 <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-zwp-green h-1 cursor-pointer bg-white/10 rounded-full"
                 />
              </div>
              
              <button 
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-2 rounded-full transition-all ${isQueueOpen ? 'text-zwp-green' : 'text-white/40 hover:text-white'}`}
              >
                <ListMusic size={24} />
              </button>

              {!isFullScreen && (
                 <div 
                   onClick={togglePlay}
                   className="md:hidden w-10 h-10 flex items-center justify-center text-white mr-2"
                 >
                   {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                 </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {isQueueOpen && <QueuePanel onClose={() => setIsQueueOpen(false)} />}
    </>
  );
};

export default Player;
