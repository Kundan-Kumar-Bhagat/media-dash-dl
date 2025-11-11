import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Video } from 'lucide-react';

interface FormatSelectorProps {
  format: 'audio' | 'video';
  audioFormat: 'mp3' | 'aac';
  videoFormat: 'mp4' | 'webm';
  quality: string;
  onFormatChange: (format: 'audio' | 'video') => void;
  onAudioFormatChange: (format: 'mp3' | 'aac') => void;
  onVideoFormatChange: (format: 'mp4' | 'webm') => void;
  onQualityChange: (quality: string) => void;
}

export const FormatSelector = ({
  format,
  audioFormat,
  videoFormat,
  quality,
  onFormatChange,
  onAudioFormatChange,
  onVideoFormatChange,
  onQualityChange,
}: FormatSelectorProps) => {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Download Options</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Format Type</Label>
          <RadioGroup value={format} onValueChange={(v) => onFormatChange(v as 'audio' | 'video')}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="audio" id="audio" />
              <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer flex-1">
                <Music className="h-4 w-4 text-primary" />
                <span>Audio Only</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="video" id="video" />
              <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                <Video className="h-4 w-4 text-primary" />
                <span>Video</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {format === 'audio' ? (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Audio Format</Label>
            <Select value={audioFormat} onValueChange={(v) => onAudioFormatChange(v as 'mp3' | 'aac')}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="aac">AAC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Video Format</Label>
              <Select value={videoFormat} onValueChange={(v) => onVideoFormatChange(v as 'mp4' | 'webm')}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Quality</Label>
              <Select value={quality} onValueChange={onQualityChange}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080">1080p (Full HD)</SelectItem>
                  <SelectItem value="720">720p (HD)</SelectItem>
                  <SelectItem value="480">480p (SD)</SelectItem>
                  <SelectItem value="360">360p</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
