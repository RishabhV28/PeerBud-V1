import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  title?: string;
}

export function PDFViewer({ fileUrl, title }: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);

  function zoom(factor: number) {
    const newScale = scale + factor;
    if (newScale >= 0.5 && newScale <= 2.5) {
      setScale(newScale);
    }
  }

  // Handle iframe load events
  function handleIframeLoad() {
    setLoading(false);
  }

  function handleIframeError() {
    setError('Failed to load PDF. Make sure the file exists and is a valid PDF.');
    setLoading(false);
  }

  return (
    <Card className="overflow-hidden w-full">
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title || 'PDF Document'}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => zoom(-0.1)}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => zoom(0.1)}
              disabled={scale >= 2.5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative w-full" style={{ height: '70vh' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center p-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button 
                variant="outline"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                Try opening in new tab
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        <iframe 
          src={fileUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center top',
            margin: '0 auto'
          }}
        />
      </div>
    </Card>
  );
}