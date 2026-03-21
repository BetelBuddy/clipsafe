import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';

export default function ReverseTool() {
  const { file, outputUrl, isProcessing } = useVideoStore();
  const [includeAudio, setIncludeAudio] = useState(false);

  const handleReverse = async () => {
    if (!file) return;
    const args = includeAudio
      ? ['-i', 'input', '-vf', 'reverse', '-af', 'areverse', 'output.mp4']
      : ['-i', 'input', '-vf', 'reverse', '-an', 'output.mp4'];
    await runFFmpegCommand(file, args, 'output.mp4');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">Reverse Video</h1>
        <p className="text-muted-foreground mt-1">Play your video backwards — great for boomerang effects</p>
      </div>

      <FileDropZone />

      {file && !outputUrl && (
        <div className="space-y-4 rounded-lg bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground">
            ⚠️ For large videos, consider trimming first. Reversing requires re-encoding the entire video.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={includeAudio} onChange={e => setIncludeAudio(e.target.checked)}
              className="w-4 h-4 rounded border-border" />
            <span className="text-sm">Reverse audio too</span>
          </label>

          <Button onClick={handleReverse} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Reverse Video
          </Button>
        </div>
      )}

      <DownloadOutput />
    </div>
  );
}
