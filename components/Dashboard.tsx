
import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Share2, Trash2, ExternalLink, Film } from 'lucide-react';
import { storageService } from '../services/storage';
import { VideoRecord } from '../types';

interface DashboardProps {
  onVideoClick: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onVideoClick }) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);

  useEffect(() => {
    setVideos(storageService.getVideos());
  }, []);

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#view=${id}`;
    navigator.clipboard.writeText(url);
    alert("Public share link copied to clipboard!");
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
        <Film size={64} className="text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-300">No recordings yet</h3>
        <p className="text-slate-500 mt-2">Start your first screen recording to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group hover:border-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/10">
          <div className="relative aspect-video bg-black cursor-pointer overflow-hidden" onClick={() => onVideoClick(video.id)}>
            <video src={video.url} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900">
                <Play className="fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-xs font-mono">
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-100 truncate w-48">{video.title}</h4>
                <p className="text-xs text-slate-400">{new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="text-slate-400 hover:text-white"><MoreVertical size={18} /></button>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center space-x-1"><span>{video.analytics.views} views</span></span>
              <span className="flex items-center space-x-1"><span>{video.analytics.totalCompletionPercent}% retention</span></span>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-slate-700">
              <button 
                onClick={() => copyLink(video.id)}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm transition-colors"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
              <button 
                onClick={() => window.open(`${window.location.origin}/#view=${video.id}`, '_blank')}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
