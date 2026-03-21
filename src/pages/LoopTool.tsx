import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand, formatTime } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const presets = [2, 3, 5, 10];

export default function LoopTool() {
  const { file, fileDuration, outputUrl, isProcessing } = useVideoStore();
  const [loops, setLoops] = useState(3);

  const handleLoop = async () => {
    if (!file) return;
    // Use concat filter to loop
    const filterParts = Array.from({ length: loops }, (_, i) => `[0:v][0:a]`).join('');
    await runFFmpegCommand(
      file,
      ['-stream_loop', String(loops - 1), '-i', 'input', '-c', 'copy', 'output.mp4'],
      'output.mp4'
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">Loop Video</h1>
        <p className="text-muted-foreground mt-1">Repeat your video multiple times into a single file</p>
      </div>

      <FileDropZone />

      {file && !outputUrl && (
        <div className="space-y-4 rounded-lg bg-card border border-border p-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Number of loops: {loops}×</label>
            <div className="flex gap-2">
              {presets.map(n => (
                <button key={n} onClick={() => setLoops(n)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                    loops === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {n}×
                </button>
              ))}
              <input type="number" min={2} max={50} value={loops}
                onChange={e => setLoops(Math.max(2, Number(e.target.value)))}
                className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm font-mono-tech" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Output duration: ~{formatTime(fileDuration * loops)}
          </p>

          <Button onClick={handleLoop} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Loop Video
          </Button>
        </div>
      )}

      <DownloadOutput />
    </div>
  );
}
