const STORAGE_KEY = 'groovify_data_v2'; // Bump version

const defaultState = {
  playlists: [{ id: 'fav', name: 'Liked Tracks', tracks: [] }],
  recent: [],
  volume: 0.8,
  queue: []
};

export const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return defaultState;
    }
    const parsed = JSON.parse(serialized);
      
    if (!parsed || !Array.isArray(parsed.playlists)) {
        return defaultState;
    }
    return { ...defaultState, ...parsed };
  } catch (err) {
    return defaultState;
  }
};

export const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Failed to save state to localStorage");
  }
};
