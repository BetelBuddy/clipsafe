import { useVideoStore } from '@/stores/videoStore';
import { formatBytes } from '@/lib/ffmpeg';
import { triggerDownload } from '@/lib/ffmpeg';
import { Download, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DownloadOutput() {
  const { outputUrl, outputSize, outputFileName, fileSize, resetOutput } = useVideoStore();

  if (!outputUrl) return null;

  const saved = fileSize > 0 ? Math.round((1 - outputSize / fileSize) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2 text-green-400">
        <Check className="w-5 h-5" />
        <span className="font-medium">Done! Your file is ready.</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Original: </span>
          <span className="font-mono">{formatBytes(fileSize)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Output: </span>
          <span className="font-mono">{formatBytes(outputSize)}</span>
        </div>
        {saved > 0 && (
          <div className="text-green-400 font-medium">Saved {saved}%</div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => triggerDownload(outputUrl, outputFileName)}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {outputFileName}
        </Button>
        <Button variant="outline" onClick={resetOutput}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Process Again
        </Button>
      </div>
    </div>
  );
}
