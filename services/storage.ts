
import { VideoRecord, VideoAnalytics } from '../types';

const STORAGE_KEY = 'voom_videos_v1';

export const storageService = {
  getVideos: (): VideoRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getVideoById: (id: string): VideoRecord | undefined => {
    const videos = storageService.getVideos();
    return videos.find(v => v.id === id);
  },

  saveVideo: (video: VideoRecord): void => {
    const videos = storageService.getVideos();
    videos.unshift(video);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  },

  updateAnalytics: (id: string, updates: Partial<VideoAnalytics>): void => {
    const videos = storageService.getVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index].analytics = { ...videos[index].analytics, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    }
  },

  trackView: (id: string): void => {
    const videos = storageService.getVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index].analytics.views += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    }
  }
};
