import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { loadState, saveState } from '../data/localStorage';
import { v4 } from 'uuid';
import { PlayerContext } from './PlayerContext';
import YouTubeService from '../services/YouTubeService';
import JamendoService from '../services/JamendoService';

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
  
  // Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const audioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const playerRef = useRef(null);
  const lastSearchTime = useRef(0);
  
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
        setIsPlaying(p => !p);
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

  const isNativeSource = useMemo(() => {
    if (!currentSong?.audioUrl) return false;
    const url = currentSong.audioUrl.toLowerCase();
    return url.includes('.mp3') || 
           url.includes('jamendo.com') || 
           url.includes('bensound.com') ||
           (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('soundcloud.com'));
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isNativeSource && audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.warn("Autoplay blocked or playback failed:", err);
            });
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, isNativeSource, currentSong]);

  // Search Implementation (Debounced & Parallel)
  const searchTracks = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
        setSearchResults([]);
        return;
    }

    const searchId = Date.now();
    lastSearchTime.current = searchId;
    setIsSearching(true);

    try {
        // Parallel fetching for high performance
        const [jamendoTracks, youtubeTracks] = await Promise.all([
            JamendoService.searchTracks(query).catch(e => { console.error(e); return []; }),
            YouTubeService.searchTracks(query).catch(e => { console.error(e); return []; })
        ]);

        // Only update if this is still the latest search
        if (lastSearchTime.current === searchId) {
            // Interleave results for a diverse mix
            const maxLength = Math.max(jamendoTracks.length, youtubeTracks.length);
            const combined = [];
            for (let i = 0; i < maxLength; i++) {
                if (jamendoTracks[i]) combined.push(jamendoTracks[i]);
                if (youtubeTracks[i]) combined.push(youtubeTracks[i]);
            }
            setSearchResults(combined);
        }
    } finally {
        if (lastSearchTime.current === searchId) {
            setIsSearching(false);
        }
    }
  }, []);

  const resumeAudio = useCallback(async () => {
    if (isPlaying) {
      if (isNativeSource && audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.warn("Native manual resume failed:", e);
        }
      } else if (playerRef.current) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      }
    }
  }, [isNativeSource, isPlaying]);

  const playSong = useCallback((song) => {
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
      playSong(nextSong);
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
        name: name || `New Playlist`,
        tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

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
    searchResults,
    isSearching,
    searchTracks,
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
    playlists, likedTracks, recentTracks, searchResults, isSearching, 
    searchTracks, playSong, togglePlay, playNext, playPrevious, setVolume, 
    seekTo, addToQueue, removeFromQueue, createPlaylist, deletePlaylist, 
    addTrackToPlaylist, removeTrackFromPlaylist, toggleLike, isLiked, 
    playbackError, resumeAudio, isBuffering
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {currentSong && currentSong.audioUrl && !isNativeSource && (
        <div id="react-player-bridge" style={{ display: 'none' }}>
            <ReactPlayer
                ref={playerRef}
                url={currentSong.audioUrl}
                playing={isPlaying}
                volume={volume}
                onProgress={(s) => setCurrentTime(s.playedSeconds)}
                onDuration={(d) => setDuration(d)}
                onBuffer={() => setIsBuffering(true)}
                onBufferEnd={() => setIsBuffering(false)}
                onError={(e) => console.error(e)}
                onEnded={playNext}
                width="0"
                height="0"
            />
        </div>
      )}
      <audio ref={audioRef} onEnded={playNext} onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)} />
      <audio ref={nextAudioRef} style={{ display: 'none' }} preload="auto" />
    </PlayerContext.Provider>
  );
};
