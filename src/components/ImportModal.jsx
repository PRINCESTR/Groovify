import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Play, Music, ArrowRight, RefreshCw } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    if (!url) return;

    if (!url.includes('youtube.com/') && !url.includes('youtu.be/') && !url.includes('soundcloud.com/')) {
      setError('Please provide a valid YouTube or SoundCloud link');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await onImport(url);
      setUrl('');
      onClose();
    } catch (err) {
      setError('Failed to import track. Please check the link.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-groovify-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-groovify-green/20 flex items-center justify-center text-groovify-green">
                <Link size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter">Import Music</h2>
                <p className="text-sm text-groovify-text-sub font-bold">Paste a link to add to your library</p>
              </div>
            </div>

            <form onSubmit={handleImport} className="space-y-6">
              <div className="relative">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-groovify-green/50 focus:border-groovify-green/50 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                  {url.includes('youtube') ? <Play size={20} className="text-red-500" /> : url.includes('soundcloud') ? <Music size={20} className="text-orange-500" /> : <Link size={20} />}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold pl-2">{error}</p>
              )}

              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                    <Play className="text-red-500" size={18} fill="currentColor" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">YouTube Support</span>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                    <Music className="text-orange-500" size={18} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">SoundCloud Support</span>
                </div>
              </div>

              <button 
                disabled={isProcessing || !url}
                className="w-full h-14 rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Add to Music Library
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImportModal;
