import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { VideoMetadata } from '@/lib/api';

interface VideoPreviewProps {
  metadata: VideoMetadata;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const VideoPreview = ({ metadata }: VideoPreviewProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={metadata.thumbnail}
          alt={metadata.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md">
          <Clock className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">
            {formatDuration(metadata.duration)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
          {metadata.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          by {metadata.uploader}
        </p>
      </div>
    </Card>
  );
};
