import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import { Trash2, Music, X, ListMusic } from 'lucide-react';

const QueuePanel = ({ isOpen, onClose }) => {
  const { queue, currentSong, playSong, removeFromQueue } = useContext(PlayerContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-[400px] h-[calc(100vh-90px)] bg-black/80 backdrop-blur-3xl border-l border-white/5 z-[90] p-6 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Queue</h2>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-zwp-text-sub hover:text-white transition-all shadow-lg"
            >
                <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Now Playing</p>
            {currentSong ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-zwp-green/10 border border-zwp-green/20 group">
                    <img src={currentSong.imageUrl} alt="now playing" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                        <p className="text-zwp-green font-black truncate">{currentSong.title}</p>
                        <p className="text-zwp-text-sub text-xs font-bold truncate opacity-70">{currentSong.artist}</p>
                    </div>
                </div>
            ) : (
                <p className="text-zwp-text-sub italic text-sm">Nothing is playing</p>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Next in Queue</p>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 scroll-smooth scrollbar-hide">
              {queue.length > 0 ? (
                queue.map((track, index) => (
                  <motion.div 
                    key={`${track.id}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 group border border-transparent hover:border-white/5 transition-all"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={track.imageUrl} alt="queue track" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button 
                            onClick={() => playSong(track)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Play size={16} fill="white" className="text-white" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-black truncate">{track.title}</p>
                        <p className="text-zwp-text-sub text-xs font-bold truncate opacity-60">{track.artist}</p>
                    </div>
                    <button 
                        onClick={() => removeFromQueue(index)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-zwp-text-sub hover:text-red-500 transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zwp-text-sub opacity-30 gap-4 mt-20">
                    <ListMusic size={64} strokeWidth={1} />
                    <p className="text-sm font-black">Your queue is empty</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Internal mini-play icon helper
const Play = ({ size, fill, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

export default QueuePanel;
