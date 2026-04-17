export const samplePlaylists = [
  {
    id: "pl1",
    title: "Global Top 50",
    description: "The most played tracks right now.",
    imageUrl: "https://i.scdn.co/image/ab67706f000000020d5402cd012f5a65c4046d33"
  },
  {
    id: "pl2",
    title: "RapCaviar",
    description: "New music from Drake, Tyga, and more.",
    imageUrl: "https://i.scdn.co/image/ab67706f00000002166a9d701cefd64d3fe34522"
  },
  {
    id: "pl3",
    title: "Chill Hits",
    description: "Kick back to the best new and recent chill hits.",
    imageUrl: "https://i.scdn.co/image/ab67706f00000002b60db5d1bcdd9c4fd1ebcffe"
  }
];

export const mockTracks = [
  // Local/Direct MP3 URLs (Simulating SoundCloud standard streams)
  {
    id: "t1",
    title: "Creative Minds",
    artist: "Bensound",
    album: "Royalty Free",
    imageUrl: "https://www.bensound.com/bensound-img/creativeminds.jpg",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3"
  },
  {
    id: "t2",
    title: "Lofi Study",
    artist: "FASSounds",
    album: "Chillhop",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3"
  },
  // YouTube specific URLs that will trigger the internal iframe via react-player
  {
    id: "t3",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    artist: "Lofi Girl",
    album: "Live Stream",
    imageUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    audioUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
  },
  {
    id: "t4",
    title: "Synthwave Radio 🌌 - Beats to chill/game to",
    artist: "Lofi Girl",
    album: "Synthwave",
    imageUrl: "https://i.ytimg.com/vi/4xDzrXCXp0H/hqdefault.jpg",
    audioUrl: "https://www.youtube.com/watch?v=4xDzrXCXp0H"
  }
];
