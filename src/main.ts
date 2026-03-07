// src/main.ts - TypeScript main entry point

interface InstagramData {
  status: boolean;
  data: {
    title?: string;
    username?: string;
    like_count?: number;
    comment_count?: number;
    comments?: Array<{username?: string; text?: string; comment?: string}>;
    images?: string[];
    videoUrl?: string;
    thumbnail?: string;
  };
  message?: string;
}

interface DownloadUrl {
  url: string;
  ext: string;
  thumb: string;
  type: string;
}

interface TransformedData {
  ok: boolean;
  detail: {
    title: string;
    username: string;
    source: string;
    like_count: number;
    comment_count: number;
    taken_at: number;
    comments: Array<{username?: string; text?: string; comment?: string}>;
  };
  downloadUrls: DownloadUrl[];
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('BMB Instagram Downloader initialized');
  
  // Check if app is installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is running in standalone mode');
    document.body.classList.add('app-installed');
  }
});
