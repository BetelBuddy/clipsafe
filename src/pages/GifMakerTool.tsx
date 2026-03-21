import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand, formatTime } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const resolutions = [
  { label: '480p', value: 480 },
  { label: '360p', value: 360 },
  { label: '240p', value: 240 },
  { label: '160p', value: 160 },
];

export default function GifMakerTool() {
  const { file, fileDuration, outputUrl, isProcessing } = useVideoStore();
  const [fps, setFps] = useState(10);
  const [maxWidth, setMaxWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);

  const handleConvert = async () => {
    if (!file) return;
    const end = Math.min(endTime, fileDuration);
    await runFFmpegCommand(
      file,
      ['-ss', String(startTime), '-to', String(end), '-i', 'input',
        '-vf', `fps=${fps},scale=${maxWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0', 'output.gif'],
      'output.gif'
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">GIF Maker</h1>
        <p className="text-muted-foreground mt-1">Convert any video clip to an animated GIF</p>
      </div>

      <FileDropZone />

      {file && !outputUrl && (
        <div className="space-y-6 rounded-lg bg-card border border-border p-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <div className="flex gap-4 items-center font-mono-tech text-sm">
              <input type="number" min={0} max={fileDuration} step={0.1} value={startTime}
                onChange={e => setStartTime(Number(e.target.value))}
                className="w-24 bg-muted border border-border rounded px-2 py-1" />
              <span className="text-muted-foreground">to</span>
              <input type="number" min={0} max={fileDuration} step={0.1} value={endTime}
                onChange={e => setEndTime(Number(e.target.value))}
                className="w-24 bg-muted border border-border rounded px-2 py-1" />
              <span className="text-muted-foreground">({formatTime(Math.min(endTime, fileDuration) - startTime)} clip)</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Frame Rate: {fps} FPS</label>
            <Slider min={5} max={30} step={1} value={[fps]} onValueChange={v => setFps(v[0])} />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Max Width</label>
            <div className="flex gap-2">
              {resolutions.map(r => (
                <button key={r.value} onClick={() => setMaxWidth(r.value)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                    maxWidth === r.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Create GIF
          </Button>
        </div>
      )}

      <DownloadOutput />
    </div>
  );
}
