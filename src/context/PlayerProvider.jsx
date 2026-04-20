import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { loadState, saveState } from '../data/localStorage';
import { v4 } from 'uuid';
import { PlayerContext } from './PlayerContext';

export const PlayerProvider = ({ children }) => {
  // Use lazy initializer for state to avoid repeated heavy computation/IO
  const [appState, setAppState] = useState(() => loadState());

  const [queue, setQueue] = useState(() => appState.queue || []);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => (appState.volume !== undefined && appState.volume !== null) ? appState.volume : 0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const audioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const playerRef = useRef(null);
  
  // Dynamic Playlists
  const [playlists, setPlaylists] = useState(() => 
    appState.playlists || [{ id: 'fav', name: 'Liked Tracks', tracks: [] }]
  );
  const [recentTracks, setRecentTracks] = useState(() => appState.recent || []);

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
  }, [currentTime, volume]);

  // Determined whether to use native audio vs ReactPlayer
  const isNativeSource = useMemo(() => {
    if (!currentSong?.audioUrl) return false;
    const url = currentSong.audioUrl.toLowerCase();
    // Use native for direct files and Jamendo
    return url.includes('.mp3') || 
           url.includes('jamendo.com') || 
           url.includes('bensound.com') ||
           (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('soundcloud.com'));
  }, [currentSong]);

  // Sync volume to native player
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playing state to native player
  useEffect(() => {
    if (isNativeSource && audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.warn("Autoplay blocked or playback failed:", err);
                // Don't set isPlaying(false) here, or it will toggle off immediately
                // Instead, the user can manually resume via resumeAudio helper if needed
            });
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, isNativeSource, currentSong]);

  // Preloading Logic
  useEffect(() => {
    if (isPlaying && duration > 0 && (duration - currentTime) < 20 && queue.length > 0) {
        const nextSong = queue[0];
        if (nextAudioRef.current && nextAudioRef.current.src !== nextSong.audioUrl) {
            nextAudioRef.current.src = nextSong.audioUrl;
            nextAudioRef.current.load();
        }
    }
  }, [isPlaying, currentTime, duration, queue]);

  // Playback Watchdog for non-native sources (YouTube/SoundCloud)
  useEffect(() => {
    if (!isPlaying || isNativeSource) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (player) {
        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration();
          
          if (typeof time === 'number' && time > 0) {
            setCurrentTime(time);
          }
          if (typeof dur === 'number' && dur > 0) {
            setDuration(dur);
          }
        } catch (e) {
          // Quietly fail
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isNativeSource]); // Removed currentTime/duration from deps

  // Resume Audio Helper (Spotify-like resilience)
  const resumeAudio = useCallback(async () => {
    if (isPlaying) {
      if (isNativeSource && audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.warn("Native manual resume failed:", e);
        }
      } else if (playerRef.current) {
        // For ReactPlayer (YouTube/SoundCloud), we toggle playing state or seek slightly 
        // to force the browser to recognize the audio context
        console.log("Attempting YouTube/SoundCloud manual resume...");
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      }
    }
  }, [isNativeSource, isPlaying]);

  const playSong = useCallback((song, fromQueue = false) => {
    if (!song) return;
    
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== song.id);
      return [song, ...filtered].slice(0, 50);
    });

    setCurrentSong(song);
    setDuration(song.duration || 0);
    setCurrentTime(0);
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
        id: v4(),
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
    // Always update currentTime if it's playing and not seeking
    // Remove the > 1 barrier for smoother tracking
    setCurrentTime(state.playedSeconds);
    
    // Auto-detect duration if not yet set
    if (duration === 0 && state.loadedSeconds > 0) {
        setDuration(state.loadedSeconds);
    }
  };

  const handleBuffer = () => setIsBuffering(true);
  const handleBufferEnd = () => setIsBuffering(false);

  const handleDuration = (dur) => {
    if (dur && dur > 0) {
        setDuration(dur);
        setPlaybackError(null);
    }
  };

  const handleError = (error) => {
    console.error('Playback Error:', error);
    
    let message = 'Media playback failed. The source might be unavailable or restricted.';
    if (currentSong?.audioUrl?.includes('youtube.com')) {
        message = 'YouTube playback failed. This video might be restricted or blocked for embedding.';
    } else if (currentSong?.audioUrl?.includes('soundcloud.com')) {
        message = 'SoundCloud playback failed. The track might be private or geo-blocked.';
    }
    
    setPlaybackError(message);
    setIsPlaying(false);
  };

  // Native Audio Event Handlers
  const onNativeTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onNativeLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
        setPlaybackError(null);
    }
  };

  const onNativeWaiting = () => setIsBuffering(true);
  const onNativePlaying = () => setIsBuffering(false);
  const onNativeEnded = () => playNext();
  const onNativeError = (e) => handleError(e);
  
  const seekTo = useCallback((seconds) => {
    if (isNativeSource && audioRef.current) {
        audioRef.current.currentTime = seconds;
        setCurrentTime(seconds);
    } else if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
      setCurrentTime(seconds);
    }
  }, [isNativeSource]);

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
    isLiked,
    playbackError,
    setPlaybackError,
    resumeAudio,
    isBuffering
  }), [
    currentSong, isPlaying, volume, currentTime, duration, queue, 
    playlists, likedTracks, recentTracks, playSong, togglePlay, 
    playNext, playPrevious, setVolume, seekTo, addToQueue, 
    removeFromQueue, createPlaylist, deletePlaylist, addTrackToPlaylist, 
    removeTrackFromPlaylist, toggleLike, isLiked, playbackError, resumeAudio, isBuffering
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {currentSong && currentSong.audioUrl && (
        <>
            {/* Main Audio Engine */}
            {isNativeSource ? (
                <audio
                    ref={audioRef}
                    src={currentSong.audioUrl}
                    onTimeUpdate={onNativeTimeUpdate}
                    onLoadedMetadata={onNativeLoadedMetadata}
                    onWaiting={onNativeWaiting}
                    onPlaying={onNativePlaying}
                    onEnded={onNativeEnded}
                    onError={onNativeError}
                    preload="auto"
                />
            ) : (
                <div 
                    id="youtube-player-container"
                    style={{ 
                        position: 'fixed', 
                        bottom: '24px', 
                        right: '24px', 
                        width: '300px', 
                        height: '200px', 
                        opacity: 0.1, // Slightly more visible for sync confirmation
                        pointerEvents: 'none', 
                        zIndex: 1000, // Ensure it's in front of everything
                        overflow: 'hidden',
                        borderRadius: '12px',
                        background: 'black'
                    }}
                >
                    <ReactPlayer
                        ref={playerRef}
                        url={currentSong.audioUrl}
                        playing={isPlaying}
                        volume={volume}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        onBuffer={handleBuffer}
                        onBufferEnd={handleBufferEnd}
                        onError={handleError}
                        onEnded={playNext}
                        width="100%"
                        height="100%"
                        playsinline
                        muted={false}
                        config={{
                            youtube: {
                                playerVars: { 
                                    autoplay: 1,
                                    controls: 1,
                                    playsinline: 1,
                                    rel: 0,
                                    showinfo: 0,
                                    enablejsapi: 1,
                                    iv_load_policy: 3
                                }
                            }
                        }}
                    />
                </div>
            )}
            
            {/* Gapless Preloader */}
            <audio ref={nextAudioRef} style={{ display: 'none' }} preload="auto" />
        </>
      )}
    </PlayerContext.Provider>
  );
};
