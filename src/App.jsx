import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerProvider';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import Player from './components/Player';

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="flex h-screen w-full bg-groovify-black text-white overflow-hidden relative font-sans">
          
          {/* Main Layout Area */}
          <div className="flex flex-1 overflow-hidden h-full pb-[90px]">
            <Sidebar />
            <div className="flex-1 overflow-hidden relative">
              <Routes>
                <Route path="/" element={<MainView view="home" />} />
                <Route path="/search" element={<MainView view="search" />} />
                <Route path="/library" element={<MainView view="library" />} />
                <Route path="/playlist/:id" element={<MainView view="playlist" />} />
              </Routes>
            </div>
          </div>
          
          {/* Fixed Bottom Player with Higher Z-index and glassmorphism */}
          <div className="absolute bottom-0 w-full h-[90px] z-[100]">
            <Player />
          </div>
        </div>
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;
