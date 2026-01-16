
import React, { useState, useEffect } from 'react';
import { AppState, VideoRecord } from './types';
import Recorder from './components/Recorder';
import Trimmer from './components/Trimmer';
import VideoPlayer from './components/VideoPlayer';
import Dashboard from './components/Dashboard';
import { storageService } from './services/storage';
import { LayoutGrid, Video, Library, Sparkles, ChevronLeft, Zap, Rocket } from 'lucide-react';

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>(AppState.HOME);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [publicViewId, setPublicViewId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#view=')) {
        const id = hash.split('=')[1];
        setPublicViewId(id);
        setActiveState(AppState.PUBLIC_VIEW);
      } else if (hash === '#dashboard') {
        setActiveState(AppState.DASHBOARD);
      } else {
        setActiveState(AppState.HOME);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRecordingComplete = (blob: Blob) => {
    setCurrentRecording(blob);
    setActiveState(AppState.TRIMMING);
  };

  const handleTrimComplete = (trimmedBlob: Blob, start: number, end: number) => {
    const id = Math.random().toString(36).substring(7);
    const videoUrl = URL.createObjectURL(trimmedBlob);
    
    const newVideo: VideoRecord = {
      id,
      url: videoUrl,
      title: `Velo Clip - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: Date.now(),
      duration: end - start,
      size: trimmedBlob.size,
      analytics: {
        views: 0,
        totalCompletionPercent: 0,
        watchTimeSeconds: 0
      }
    };

    storageService.saveVideo(newVideo);
    window.location.hash = `#view=${id}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      {/* Velo Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => window.location.hash = '#'}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-all duration-300">
              <Rocket size={20} className="text-white fill-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tighter text-white">VELO</span>
              <div className="h-0.5 w-full bg-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
            <button 
              onClick={() => window.location.hash = '#'} 
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeState === AppState.HOME ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Video size={18} />
              <span>Record</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#dashboard'} 
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeState === AppState.DASHBOARD ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Library size={18} />
              <span>Library</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {activeState === AppState.HOME && (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
               <h1 className="text-6xl font-black tracking-tight text-white leading-[1.1]">
                Say it with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Velocity.</span>
               </h1>
               <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium leading-relaxed">
                 Record high-quality screen and camera messages instantly. Skip the sync and move your projects forward.
               </p>
            </div>
            <Recorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {activeState === AppState.TRIMMING && currentRecording && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
             <Trimmer videoBlob={currentRecording} onTrimComplete={handleTrimComplete} />
          </div>
        )}

        {activeState === AppState.DASHBOARD && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-black text-white">Your Library</h2>
                <p className="text-slate-400 mt-2 text-lg">Managing {storageService.getVideos().length} recordings across your Velo workspace.</p>
              </div>
            </div>
            <Dashboard onVideoClick={(id) => window.location.hash = `#view=${id}`} />
          </div>
        )}

        {activeState === AppState.PUBLIC_VIEW && publicViewId && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => window.location.hash = '#dashboard'}
              className="group flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Library</span>
            </button>
            <VideoPlayer videoId={publicViewId} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 py-12 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Rocket size={16} className="text-indigo-500" />
            <span className="font-bold text-slate-300 tracking-wider">VELO</span>
          </div>
          <p>© 2024 Velo Communication Technologies. Move fast, stay clear.</p>
          <div className="flex space-x-8 mt-4 md:mt-0 font-medium">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
