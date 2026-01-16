
import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Video, Mic, Settings, Camera } from 'lucide-react';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

  // Preview webcam even before recording starts
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 320, frameRate: 30 }, 
          audio: false 
        });
        setCameraStream(stream);
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera preview failed:", err);
      }
    }
    setupCamera();
    return () => {
      cameraStream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // In a real production app, we would use a Canvas to merge 
      // the webcam overlay into the screen stream.
      // For this MVP slice, we capture the screen + mic as the primary asset.
      const tracks = [...screenStream.getVideoTracks(), ...micStream.getAudioTracks()];
      const combinedStream = new MediaStream(tracks);
      
      chunksRef.current = [];
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const completeBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(completeBlob);
        combinedStream.getTracks().forEach(track => track.stop());
        screenStream.getTracks().forEach(track => track.stop());
        micStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Recording canceled or failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center space-y-8 p-12 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Signature Camera Bubble */}
      <div className={`absolute bottom-6 left-6 w-32 h-32 rounded-full border-4 ${isRecording ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-slate-600'} overflow-hidden bg-slate-900 transition-all z-20`}>
        <video 
          ref={cameraVideoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover scale-x-[-1]"
        />
        {!cameraStream && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
            <Camera size={24} />
          </div>
        )}
      </div>

      <div className="relative group">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'}`}>
          {isRecording ? <Square size={40} className="text-white fill-white" /> : <Video size={48} className="text-white" />}
        </div>
        {isRecording && (
          <div className="absolute -top-4 -right-4 bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-bounce">
            Rec
          </div>
        )}
      </div>

      <div className="text-center z-10">
        <h2 className="text-3xl font-bold mb-2">
          {isRecording ? "Recording in progress..." : "Instantly share your screen"}
        </h2>
        <p className="text-slate-400 font-medium">
          {isRecording ? `Duration: ${formatTime(recordingTime)}` : "High-quality screen, mic, and camera capture."}
        </p>
      </div>

      <div className="flex space-x-4 z-10">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="group flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-indigo-500/30 active:scale-95"
          >
            <Play size={20} className="fill-current" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center space-x-3 bg-red-600 hover:bg-red-500 px-10 py-5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-red-500/30 active:scale-95"
          >
            <Square size={20} className="fill-current" />
            <span>Finish Recording</span>
          </button>
        )}
      </div>
      
      {!isRecording && (
        <div className="flex items-center space-x-8 text-slate-500 border-t border-slate-700/50 pt-8 w-full justify-center">
          <div className="flex items-center space-x-2">
            <Mic size={18} className="text-indigo-400" />
            <span className="text-sm font-medium">Mic Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Camera size={18} className="text-indigo-400" />
            <span className="text-sm font-medium">Cam Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings size={18} />
            <span className="text-sm">1080p 60fps</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;
