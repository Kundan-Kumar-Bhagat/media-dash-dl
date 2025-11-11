import { useState, useEffect } from 'react';
import { UrlInput } from '@/components/UrlInput';
import { VideoPreview } from '@/components/VideoPreview';
import { FormatSelector } from '@/components/FormatSelector';
import { DownloadProgress } from '@/components/DownloadProgress';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, type VideoMetadata, type DownloadProgress as DownloadProgressType } from '@/lib/api';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [format, setFormat] = useState<'audio' | 'video'>('video');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'aac'>('mp3');
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [quality, setQuality] = useState('720');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgressType | null>(null);
  const { toast } = useToast();

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    try {
      // Validate URL
      const validation = await api.validateUrl(url);
      if (!validation.valid) {
        toast({
          title: 'Invalid URL',
          description: validation.message || 'Please enter a valid YouTube URL',
          variant: 'destructive',
        });
        return;
      }

      // Fetch metadata
      const data = await api.fetchMetadata(url);
      setMetadata(data);
      toast({
        title: 'Video Found',
        description: 'Ready to download',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch video information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!metadata) return;

    setDownloading(true);
    setProgress({
      percentage: 0,
      speed: '',
      eta: '',
      status: 'downloading',
    });

    const eventSource = api.createDownloadStream({
      url: window.location.href, // This would be the actual YouTube URL in production
      format,
      quality: format === 'video' ? quality : undefined,
      audioFormat: format === 'audio' ? audioFormat : undefined,
      videoFormat: format === 'video' ? videoFormat : undefined,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
      
      if (data.status === 'complete') {
        eventSource.close();
        setDownloading(false);
        toast({
          title: 'Success',
          description: 'Download completed successfully',
        });
      } else if (data.status === 'error') {
        eventSource.close();
        setDownloading(false);
        toast({
          title: 'Download Failed',
          description: data.message || 'An error occurred during download',
          variant: 'destructive',
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setDownloading(false);
      toast({
        title: 'Connection Error',
        description: 'Lost connection to server',
        variant: 'destructive',
      });
    };
  };

  const handleReset = () => {
    setMetadata(null);
    setProgress(null);
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              YouTube Video{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Downloader
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Download YouTube videos and audio in high quality. Fast, secure, and easy to use.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {!metadata ? (
            <div className="space-y-8">
              <UrlInput onSubmit={handleUrlSubmit} loading={loading} />
              
              <div className="grid md:grid-cols-3 gap-6 pt-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">High Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Download videos up to 1080p resolution
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time progress tracking
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Files auto-deleted after 1 hour
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-border"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Download
                </Button>
              </div>

              <VideoPreview metadata={metadata} />

              {!downloading && !progress && (
                <>
                  <FormatSelector
                    format={format}
                    audioFormat={audioFormat}
                    videoFormat={videoFormat}
                    quality={quality}
                    onFormatChange={setFormat}
                    onAudioFormatChange={setAudioFormat}
                    onVideoFormatChange={setVideoFormat}
                    onQualityChange={setQuality}
                  />

                  <Button
                    onClick={handleDownload}
                    className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Start Download
                  </Button>
                </>
              )}

              {progress && <DownloadProgress progress={progress} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
