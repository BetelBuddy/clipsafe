import { useState, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Copy, Check } from 'lucide-react';

interface VideoMeta {
  name: string;
  size: string;
  type: string;
  lastModified: string;
  duration?: string;
  width?: number;
  height?: number;
}

export default function MetadataTool() {
  const { file, fileUrl, fileName } = useVideoStore();
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [copied, setCopied] = useState(false);

  const analyzeMeta = useCallback(async () => {
    if (!file) return;
    const info: VideoMeta = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified).toLocaleString(),
    };

    if (fileUrl && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      const el = document.createElement(file.type.startsWith('audio/') ? 'audio' : 'video');
      el.src = fileUrl;
      await new Promise<void>((resolve) => {
        el.onloadedmetadata = () => {
          info.duration = `${el.duration.toFixed(2)}s`;
          if (file.type.startsWith('video/')) {
            info.width = (el as HTMLVideoElement).videoWidth;
            info.height = (el as HTMLVideoElement).videoHeight;
          }
          resolve();
        };
        el.onerror = () => resolve();
      });
    }
    setMeta(info);
  }, [file, fileUrl]);

  const handleCopy = () => {
    if (!meta) return;
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Metadata Viewer</h1>
        <p className="text-muted-foreground text-sm mt-1">View detailed file metadata and technical information.</p>
      </div>

      {!file && <FileDropZone />}

      {file && (
        <div className="space-y-4">
          <Button onClick={analyzeMeta} className="w-full" size="lg">
            <FileText className="w-4 h-4 mr-2" /> Analyze Metadata
          </Button>

          {meta && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">File Information</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <ScrollArea className="max-h-80">
                <div className="space-y-2 text-sm">
                  {Object.entries(meta).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-mono text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
