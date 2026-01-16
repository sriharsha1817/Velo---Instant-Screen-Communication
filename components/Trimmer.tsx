
import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Download, Share2, ArrowRight, Loader2 } from 'lucide-react';

interface TrimmerProps {
  videoBlob: Blob;
  onTrimComplete: (trimmedBlob: Blob, start: number, end: number) => void;
}

const Trimmer: React.FC<TrimmerProps> = ({ videoBlob, onTrimComplete }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  const handleTrim = async () => {
    setIsProcessing(true);
    
    // NOTE: In a production environment with proper headers, we would use FFmpeg.wasm here.
    // For this demonstration, we'll simulate the processing delay and return the blob
    // with start/end time markers, as the real FFmpeg requires SharedArrayBuffer.
    
    setTimeout(() => {
      onTrimComplete(videoBlob, startTime, endTime);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Trim your recording</h2>
          <p className="text-slate-400">Refine your message before sharing.</p>
        </div>
        <div className="bg-slate-700/50 px-4 py-2 rounded-lg text-indigo-400 font-mono">
          {Math.max(0, endTime - startTime).toFixed(1)}s Selected
        </div>
      </div>

      <div className="relative group rounded-xl overflow-hidden bg-black mb-8 aspect-video">
        <video 
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          controls
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400 px-1">
            <span>Start: {startTime.toFixed(1)}s</span>
            <span>End: {endTime.toFixed(1)}s</span>
          </div>
          <div className="relative h-12 bg-slate-900 rounded-lg flex items-center px-4">
             {/* Simple visual timeline mock */}
             <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden relative">
                <div 
                  className="absolute h-full bg-indigo-500 opacity-30" 
                  style={{ left: `${(startTime / duration) * 100}%`, right: `${100 - (endTime / duration) * 100}%` }}
                />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Start Time</label>
              <input 
                type="range" 
                min="0" 
                max={endTime} 
                step="0.1"
                value={startTime} 
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">End Time</label>
              <input 
                type="range" 
                min={startTime} 
                max={duration} 
                step="0.1"
                value={endTime} 
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-4">
          <button 
            disabled={isProcessing}
            onClick={handleTrim}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Scissors size={20} />}
            <span>{isProcessing ? "Processing..." : "Trim & Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Trimmer;
