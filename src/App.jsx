import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerProvider';

const Sidebar = lazy(() => import('./components/Sidebar'));
const MainView = lazy(() => import('./components/MainView'));
const Player = lazy(() => import('./components/Player'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-groovify-black">
    <div className="w-12 h-12 border-4 border-groovify-green border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="flex h-screen w-full bg-groovify-black text-white overflow-hidden relative font-sans">
          
          {/* Main Layout Area */}
          <div className="flex flex-1 overflow-hidden h-full pb-[90px]">
            <Suspense fallback={<div className="w-[280px] hidden md:block bg-neutral-900" />}>
              <Sidebar />
            </Suspense>
            <div className="flex-1 overflow-hidden relative">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<MainView view="home" />} />
                  <Route path="/search" element={<MainView view="search" />} />
                  <Route path="/library" element={<MainView view="library" />} />
                  <Route path="/playlist/:id" element={<MainView view="playlist" />} />
                </Routes>
              </Suspense>
            </div>
          </div>
          
          {/* Fixed Bottom Player with Higher Z-index and glassmorphism */}
          <div className="absolute bottom-0 w-full h-[90px] z-[100]">
            <Suspense fallback={null}>
              <Player />
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;
