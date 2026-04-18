import { useContext, useState, useEffect, useRef } from 'react';
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
  Maximize2,
  ChevronDown,
  LayoutList
} from 'lucide-react';
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
    queue
  } = useContext(PlayerContext);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [tempTime, setTempTime] = useState(0);

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e) => {
    setIsSeeking(true);
    setTempTime(Number(e.target.value));
  };

  const handleProgressMouseUp = (e) => {
    setIsSeeking(false);
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
  };

  const toggleMute = () => {
    setVolume(volume > 0 ?  0 : 0.8);
  };

  if (!currentSong) {
    return (
      <div className="w-full h-full flex items-center justify-center text-groovify-text-sub font-black tracking-widest text-xs uppercase bg-black/80 backdrop-blur-3xl border-t border-white/5">
        Ready for groovify
      </div>
    );
  }

  const currentLikeStatus = isLiked(currentSong.id);
  const actualTime = isSeeking ? tempTime : currentTime;
  const progressPercentage = duration ? (actualTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  return (
    <>
      {/* Queue Sidebar Overlay */}
      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

      {/* Bottom Bar Player */}
      <div className="w-full h-full flex justify-between items-center px-6 bg-black/90 backdrop-blur-3xl relative z-[110] border-t border-white/5 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
        {/* Left: Track Info */}
        <div className="flex items-center gap-5 w-[30%] min-w-[240px]">
          <motion.div 
            layoutId="player-art"
            className="w-14 h-14 bg-groovify-card rounded-lg shadow-2xl overflow-hidden relative cursor-pointer group flex-shrink-0"
            onClick={() => setIsFullScreen(true)}
          >
            <img src={currentSong.imageUrl} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={16} className="text-white" />
            </div>
          </motion.div>
          <div className="flex flex-col justify-center overflow-hidden">
            <motion.span 
                layoutId="player-title"
                className="text-white text-[15px] font-black truncate hover:underline cursor-pointer tracking-tight"
            >
              {currentSong.title}
            </motion.span>
            <motion.span 
                layoutId="player-artist"
                className="text-groovify-text-sub text-xs font-bold truncate hover:underline cursor-pointer opacity-70"
            >
              {currentSong.artist}
            </motion.span>
          </div>
          <button 
            onClick={() => toggleLike(currentSong)}
            className={`p-2 rounded-full transition-all hover:scale-125 ml-2 ${currentLikeStatus ? 'text-groovify-green' : 'text-groovify-text-sub hover:text-white'}`}
          >
            <Heart size={20} fill={currentLikeStatus ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center justify-center w-[40%] max-w-[700px]">
          <div className="flex items-center gap-7 mb-2">
            <button className="text-groovify-text-sub hover:text-white transition-colors">
              <Shuffle size={18} />
            </button>
            <button onClick={playPrevious} className="text-groovify-text-sub hover:text-white transition-all hover:scale-110 active:scale-90">
              <SkipBack size={24} fill="currentColor" />
            </button>
            
            <button 
              onClick={togglePlay} 
              className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button onClick={playNext} className="text-groovify-text-sub hover:text-white transition-all hover:scale-110 active:scale-90">
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button className="text-groovify-text-sub hover:text-white transition-colors">
              <Repeat size={18} />
            </button>
          </div>

          <div className="w-full flex items-center gap-3 group">
            <span className="text-[11px] font-black text-white/40 min-w-[40px] text-right">
              {formatTime(actualTime)}
            </span>
            <div className="flex-1 relative flex items-center h-4 group">
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={actualTime}
                onChange={handleProgressChange}
                onMouseUp={handleProgressMouseUp}
                onTouchEnd={handleProgressMouseUp}
                style={{ '--val': `${progressPercentage}%` }}
                className="progress-slider"
              />
            </div>
            <span className="text-[11px] font-black text-white/40 min-w-[40px]">
              {duration > 0 ? formatTime(duration) : 'Stream'}
            </span>
          </div>
        </div>

        {/* Right: Extra controls */}
        <div className="flex items-center justify-end gap-5 w-[30%] min-w-[240px]">
          <button 
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`transition-all hover:scale-110 ${isQueueOpen ? 'text-groovify-green' : 'text-groovify-text-sub hover:text-white'}`}
          >
            <LayoutList size={20} />
          </button>
          <button className="text-groovify-text-sub hover:text-white transition-all hover:scale-110" onClick={() => setIsFullScreen(true)}>
            <Maximize2 size={19} />
          </button>
          <div className="flex items-center gap-3 group w-28">
            <button onClick={toggleMute} className="text-groovify-text-sub hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="flex-1 relative flex items-center h-4">
               <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{ '--val': `${volumePercentage}%` }}
                className="progress-slider h-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Player */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-12 overflow-hidden bg-black"
          >
            {/* Dynamic Background Blur */}
            <div 
                className="absolute inset-0 bg-cover bg-center scale-150 opacity-40 grayscale-[0.3]"
                style={{ backgroundImage: `url(${currentSong.imageUrl})`, filter: 'blur(120px)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />

            {/* Header */}
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-10">
                <button onClick={() => setIsFullScreen(false)} className="text-white/40 hover:text-white transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-all">
                        <ChevronDown size={32} />
                    </div>
                    <div>
                        <p className="font-black text-[10px] tracking-widest uppercase opacity-40">Playing From</p>
                        <p className="font-black text-sm tracking-tight">Groovify Cinematic</p>
                    </div>
                </button>
                <div className="text-white/20 font-black text-xl tracking-tighter uppercase italic">Groovify PRO</div>
                <button 
                  onClick={() => { setIsFullScreen(false); setIsQueueOpen(true); }}
                  className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl"
                >
                    <ListMusic size={28} />
                </button>
            </div>

            {/* Content Container */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-40 w-full max-w-7xl z-10">
                {/* Large Artwork */}
                <motion.div 
                    layoutId="player-art"
                    className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 relative"
                >
                    <img src={currentSong.imageUrl} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>

                {/* Controls Info Area */}
                <div className="flex flex-col items-start w-full lg:w-[500px]">
                    <motion.div layoutId="player-info" className="mb-12">
                        <motion.h1 layoutId="player-title" className="text-5xl lg:text-7xl font-black text-white mb-4 tracking-tighter leading-none pr-4">
                            {currentSong.title}
                        </motion.h1>
                        <motion.h2 layoutId="player-artist" className="text-2xl font-black text-groovify-green mb-10 tracking-tight opacity-90">
                            {currentSong.artist}
                        </motion.h2>
                    </motion.div>

                    {/* Progress Area */}
                    <div className="w-full mb-10 group">
                        <div className="flex justify-between text-base font-black text-white/30 mb-4 tabular-nums">
                            <span>{formatTime(actualTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="relative h-2 w-full flex items-center">
                            <input 
                                type="range" 
                                min="0" 
                                max={duration || 100} 
                                value={actualTime}
                                onChange={handleProgressChange}
                                onMouseUp={handleProgressMouseUp}
                                onTouchEnd={handleProgressMouseUp}
                                style={{ '--val': `${progressPercentage}%` }}
                                className="progress-slider h-2 transition-all group-hover:h-3"
                            />
                        </div>
                    </div>

                    {/* Master Controls */}
                    <div className="flex items-center justify-between w-full">
                        <Shuffle size={36} className="text-white/30 hover:text-white transition-all cursor-pointer hover:scale-110" />
                        <SkipBack size={54} fill="white" onClick={playPrevious} className="text-white hover:scale-110 active:scale-90 transition-all cursor-pointer" />
                        <button 
                            onClick={togglePlay}
                            className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-black shadow-2xl hover:scale-105 active:scale-90 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                        >
                            {isPlaying ? <Pause size={54} fill="currentColor" /> : <Play size={54} fill="currentColor" className="ml-3" />}
                        </button>
                        <SkipForward size={54} fill="white" onClick={playNext} className="text-white hover:scale-110 active:scale-90 transition-all cursor-pointer" />
                        <Repeat size={36} className="text-white/30 hover:text-white transition-all cursor-pointer hover:scale-110" />
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Player;
