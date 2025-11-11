// API client for YouTube downloader backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  formats: Array<{
    format_id: string;
    ext: string;
    resolution: string;
    filesize?: number;
  }>;
}

export interface DownloadRequest {
  url: string;
  format: 'audio' | 'video';
  quality?: string;
  audioFormat?: 'mp3' | 'aac';
  videoFormat?: 'mp4' | 'webm';
}

export interface DownloadProgress {
  percentage: number;
  speed: string;
  eta: string;
  status: 'downloading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export const api = {
  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to validate URL');
    }
    
    return response.json();
  },

  async fetchMetadata(url: string): Promise<VideoMetadata> {
    const response = await fetch(`${API_BASE_URL}/api/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch metadata');
    }
    
    return response.json();
  },

  createDownloadStream(request: DownloadRequest): EventSource {
    const params = new URLSearchParams({
      url: request.url,
      format: request.format,
      ...(request.quality && { quality: request.quality }),
      ...(request.audioFormat && { audio_format: request.audioFormat }),
      ...(request.videoFormat && { video_format: request.videoFormat }),
    });

    return new EventSource(`${API_BASE_URL}/api/download?${params}`);
  },
};
