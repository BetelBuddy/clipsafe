import { useVideoStore } from '@/stores/videoStore';
import { Loader2 } from 'lucide-react';

export function ProcessingOverlay() {
  const { isProcessing, processingProgress, processingLabel, processingLog } = useVideoStore();

  if (!isProcessing) return null;

  return (
    <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 rounded-lg">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <div className="text-center">
        <p className="font-medium text-lg">{processingLabel || 'Processing...'}</p>
        <p className="text-sm text-muted-foreground mt-1">{processingProgress}%</p>
      </div>
      <div className="w-64 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.max(processingProgress, 2)}%` }}
        />
      </div>
      {processingLog.length > 0 && (
        <div className="max-w-sm text-xs font-mono text-muted-foreground text-center line-clamp-3">
          {processingLog.slice(-2).map((l, i) => <p key={i} className="truncate">{l}</p>)}
        </div>
      )}
    </div>
  );
}
