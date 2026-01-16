
export interface VideoAnalytics {
  views: number;
  totalCompletionPercent: number;
  watchTimeSeconds: number;
}

export interface VideoRecord {
  id: string;
  url: string;
  title: string;
  createdAt: number;
  duration: number;
  size: number;
  analytics: VideoAnalytics;
}

export enum AppState {
  HOME = 'HOME',
  RECORDING = 'RECORDING',
  TRIMMING = 'TRIMMING',
  DASHBOARD = 'DASHBOARD',
  PUBLIC_VIEW = 'PUBLIC_VIEW'
}
