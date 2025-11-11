import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Download, Loader2 } from 'lucide-react';
import type { DownloadProgress as DownloadProgressType } from '@/lib/api';

interface DownloadProgressProps {
  progress: DownloadProgressType;
}

export const DownloadProgress = ({ progress }: DownloadProgressProps) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'complete':
        return <CheckCircle2 className="h-8 w-8 text-primary" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-destructive" />;
      case 'downloading':
        return <Download className="h-8 w-8 text-primary animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'complete':
        return 'Download Complete';
      case 'error':
        return 'Download Failed';
      case 'downloading':
        return 'Downloading...';
      case 'processing':
        return 'Processing...';
    }
  };

  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{getStatusText()}</h3>
            {progress.message && (
              <p className="text-sm text-muted-foreground mt-1">{progress.message}</p>
            )}
          </div>
        </div>

        {progress.status !== 'error' && progress.status !== 'complete' && (
          <>
            <Progress value={progress.percentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.percentage.toFixed(1)}%</span>
              <div className="flex gap-4">
                {progress.speed && <span>Speed: {progress.speed}</span>}
                {progress.eta && <span>ETA: {progress.eta}</span>}
              </div>
            </div>
          </>
        )}

        {progress.status === 'complete' && (
          <div className="text-sm text-muted-foreground">
            Your file is ready and will be automatically cleaned up after 1 hour.
          </div>
        )}
      </div>
    </Card>
  );
};
