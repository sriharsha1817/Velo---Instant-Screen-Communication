
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Maximize, Clock, BarChart3, Eye, Zap } from 'lucide-react';
import { storageService } from '../services/storage';
import { VideoRecord } from '../types';

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const [video, setVideo] = useState<VideoRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const found = storageService.getVideoById(videoId);
    if (found) {
      setVideo(found);
      storageService.trackView(videoId);
    }
  }, [videoId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(current);
      if (current > maxProgress) {
        setMaxProgress(current);
        storageService.updateAnalytics(videoId, { totalCompletionPercent: Math.round(current) });
      }
    }
  };

  if (!video) return <div className="text-center p-20 text-slate-400">Video not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group border border-slate-800/50 p-2">
        <div className="rounded-[2rem] overflow-hidden bg-black relative">
          <video 
            ref={videoRef}
            src={video.url}
            className="w-full aspect-video cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-end p-8">
             <div className="flex items-center justify-between pointer-events-auto">
                <button onClick={togglePlay} className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform">
                  {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                </button>
                <div className="flex-1 mx-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center space-x-5 text-white">
                  <Volume2 size={22} className="cursor-pointer hover:text-indigo-400 transition-colors" />
                  <Maximize size={22} className="cursor-pointer hover:text-indigo-400 transition-colors" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-4xl font-black text-white tracking-tight">{video.title}</h1>
          <div className="flex items-center text-slate-400 text-sm space-x-6 bg-slate-800/30 w-fit px-4 py-2 rounded-full border border-slate-700/50">
            <span className="flex items-center space-x-2"><Clock size={16} className="text-indigo-400" /> <span>{new Date(video.createdAt).toLocaleDateString()}</span></span>
            <span className="flex items-center space-x-2"><Eye size={16} className="text-indigo-400" /> <span>{video.analytics.views} views</span></span>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed">
            Captured with <span className="text-indigo-400 font-bold">Velo</span>. Delivering clear, concise visual context with the speed of thought.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 space-y-8 self-start shadow-xl">
          <div className="flex items-center space-x-3 text-indigo-400 font-black uppercase tracking-widest text-xs">
            <BarChart3 size={18} />
            <span>Real-time Analytics</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-400 font-medium">Audience Retention</span>
                <span className="text-white font-black">{video.analytics.totalCompletionPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000" style={{ width: `${video.analytics.totalCompletionPercent}%` }} />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-700/50">
               <div className="flex items-start space-x-3">
                  <Zap size={16} className="text-indigo-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-500 leading-normal font-medium">Velo automatically tracks viewer engagement peaks and drop-offs to help you optimize your communication.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
