import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { loadState, saveState } from '../data/localStorage';
import { v4 as uuidv4 } from 'uuid';
import { PlayerContext } from './PlayerContext';

export const PlayerProvider = ({ children }) => {
  // Use lazy initializer for state to avoid repeated heavy computation/IO
  const [appState, setAppState] = useState(() => loadState());

  const [queue, setQueue] = useState(() => appState.queue || []);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => appState.volume || 0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const watchdogInterval = useRef(null);
  
  // Dynamic Playlists
  const [playlists, setPlaylists] = useState(() => 
    appState.playlists || [{ id: 'fav', name: 'Liked Tracks', tracks: [] }]
  );
  const [recentTracks, setRecentTracks] = useState(() => appState.recent || []);

  const playerRef = useRef(null);

  // Memoize likedTracks to prevent unnecessary recalculations
  const likedTracks = useMemo(() => 
    (playlists || []).find(p => p && p.id === 'fav')?.tracks || []
  , [playlists]);

  // Persistence side effects
  useEffect(() => {
    saveState({
      volume,
      queue,
      recent: recentTracks,
      playlists: playlists
    });
  }, [volume, queue, recentTracks, playlists]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p); // Directly toggle for speed
      } else if (e.code === 'ArrowRight') {
        seekTo(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        seekTo(Math.max(0, currentTime - 5));
      } else if (e.code === 'KeyM') {
        setVolume(v => v === 0 ? 0.8 : 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);

  // Playback Watchdog: Ensures currentTime updates even if onProgress stalls
  useEffect(() => {
    if (isPlaying && !isBuffering) {
        watchdogInterval.current = setInterval(() => {
            setCurrentTime(prev => {
                if (duration && prev >= duration) return prev;
                return prev + 0.25; // High resolution update
            });
        }, 250);
    } else {
        clearInterval(watchdogInterval.current);
    }
    return () => clearInterval(watchdogInterval.current);
  }, [isPlaying, isBuffering, duration]);

  const playSong = useCallback((song, fromQueue = false) => {
    if (!song) return;
    
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== song.id);
      return [song, ...filtered].slice(0, 50);
    });

    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(q => q.slice(1));
      playSong(nextSong, true);
    }
  }, [queue, playSong]);

  const playPrevious = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
    } else if (recentTracks.length > 1) {
        playSong(recentTracks[1]);
    }
  }, [currentTime, recentTracks, playSong]);

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const createPlaylist = useCallback((name) => {
    const newPlaylist = {
        id: uuidv4(),
        name: name || `New Playlist #${playlists.length}`,
        tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  }, [playlists.length]);

  const deletePlaylist = useCallback((id) => {
    if (id === 'fav') return;
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
            if (p.tracks.some(t => t.id === track.id)) return p;
            return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
    }));
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
            return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
        }
        return p;
    }));
  }, []);

  const toggleLike = useCallback((song) => {
    const isCurrentlyLiked = likedTracks.some(t => t.id === song.id);
    if (isCurrentlyLiked) {
        removeTrackFromPlaylist('fav', song.id);
    } else {
        addTrackToPlaylist('fav', song);
    }
  }, [likedTracks, addTrackToPlaylist, removeTrackFromPlaylist]);

  const isLiked = useCallback((songId) => 
    likedTracks.some(t => t && t.id === songId)
  , [likedTracks]);

  const handleProgress = (state) => {
    if (!isBuffering) {
        // Sync with actual player time if provided, otherwise watchdog handled it
        if (Math.abs(state.playedSeconds - currentTime) > 1) {
            setCurrentTime(state.playedSeconds);
        }
    }
  };

  const handleBuffer = () => setIsBuffering(true);
  const handleBufferEnd = () => setIsBuffering(false);

  const handleDuration = (dur) => {
    if (dur && dur > 0) {
        setDuration(dur);
    }
  };
  
  const seekTo = useCallback((seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
      setCurrentTime(seconds);
    }
  }, []);

  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    playlists,
    likedTracks,
    recentTracks,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seekTo,
    addToQueue,
    removeFromQueue,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    toggleLike,
    isLiked
  }), [
    currentSong, isPlaying, volume, currentTime, duration, queue, 
    playlists, likedTracks, recentTracks, playSong, togglePlay, 
    playNext, playPrevious, setVolume, seekTo, addToQueue, 
    removeFromQueue, createPlaylist, deletePlaylist, addTrackToPlaylist, 
    removeTrackFromPlaylist, toggleLike, isLiked
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {currentSong && currentSong.audioUrl && (
        <ReactPlayer
          ref={playerRef}
          url={currentSong.audioUrl}
          playing={isPlaying}
          volume={volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          onEnded={playNext}
          width="0"
          height="0"
          style={{ display: 'none' }}
          config={{
            youtube: {
              playerVars: { controls: 0, showinfo: 0, modestbranding: 1 }
            },
            file: {
              forceAudio: true,
              attributes: {
                preload: 'auto',
                crossOrigin: 'anonymous'
              }
            }
          }}
        />
      )}
    </PlayerContext.Provider>
  );
};
