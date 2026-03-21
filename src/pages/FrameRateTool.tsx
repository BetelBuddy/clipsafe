import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fpsPresets = [15, 24, 25, 30, 48, 60];

export default function FrameRateTool() {
  const { file, outputUrl, isProcessing } = useVideoStore();
  const [targetFps, setTargetFps] = useState(30);

  const handleChange = async () => {
    if (!file) return;
    await runFFmpegCommand(
      file,
      ['-i', 'input', '-filter:v', `fps=fps=${targetFps}`, '-c:a', 'copy', 'output.mp4'],
      'output.mp4'
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">Frame Rate Changer</h1>
        <p className="text-muted-foreground mt-1">Change your video's FPS — smooth slow-mo or reduce for smaller files</p>
      </div>

      <FileDropZone />

      {file && !outputUrl && (
        <div className="space-y-4 rounded-lg bg-card border border-border p-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Target Frame Rate: {targetFps} FPS</label>
            <div className="flex flex-wrap gap-2">
              {fpsPresets.map(f => (
                <button key={f} onClick={() => setTargetFps(f)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                    targetFps === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {f} FPS
                </button>
              ))}
              <input type="number" min={1} max={120} value={targetFps}
                onChange={e => setTargetFps(Math.max(1, Number(e.target.value)))}
                className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm font-mono-tech" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Lowering FPS reduces file size. Increasing FPS won't add real detail but can smooth playback.
          </p>

          <Button onClick={handleChange} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Change Frame Rate
          </Button>
        </div>
      )}

      <DownloadOutput />
    </div>
  );
}
