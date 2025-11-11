import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

export const UrlInput = ({ onSubmit, loading }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a YouTube URL',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="relative">
        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="pl-12 h-14 text-lg bg-card border-border focus:border-primary transition-colors"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Fetching video info...
          </>
        ) : (
          'Get Video Info'
        )}
      </Button>
    </form>
  );
};
