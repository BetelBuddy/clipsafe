import { useState } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock } from 'lucide-react';

const resizePresets = [
  { label: '4K', w: 3840, h: 2160 },
  { label: '1080p', w: 1920, h: 1080 },
  { label: '720p', w: 1280, h: 720 },
  { label: '480p', w: 854, h: 480 },
  { label: '360p', w: 640, h: 360 },
  { label: 'Instagram Square', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'TikTok', w: 1080, h: 1920 },
  { label: 'Twitter/X', w: 1280, h: 720 },
];

const cropRatios = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16/9 },
  { label: '9:16', value: 9/16 },
  { label: '4:3', value: 4/3 },
];

export default function ResizeTool() {
  const { file, fileUrl, fileWidth, fileHeight, isProcessing } = useVideoStore();
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [lockAspect, setLockAspect] = useState(true);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const handleResize = async () => {
    if (!file) return;
    useVideoStore.getState().setProcessing(true, 'Resizing video...');
    await runFFmpegCommand(file, ['-i', 'input', '-vf', `scale=${width}:${height}`, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4'], 'output.mp4');
  };

  const handleCrop = async () => {
    if (!file || !cropW || !cropH) return;
    useVideoStore.getState().setProcessing(true, 'Cropping video...');
    await runFFmpegCommand(file, ['-i', 'input', '-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4'], 'output.mp4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Resize & Crop</h1>
        <p className="text-sm text-muted-foreground mt-1">Change resolution or crop to any dimension</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <Tabs defaultValue="resize" className="space-y-4">
          <TabsList className="bg-surface-elevated border border-border">
            <TabsTrigger value="resize">Resize</TabsTrigger>
            <TabsTrigger value="crop">Crop</TabsTrigger>
          </TabsList>

          <TabsContent value="resize" className="space-y-4">
            <div className="rounded-lg bg-card border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Current resolution</p>
              <p className="font-mono font-medium">{fileWidth} × {fileHeight}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {resizePresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className={`px-3 py-2 rounded-md text-sm border transition-all ${
                    width === p.w && height === p.h
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => {
                    const w = parseInt(e.target.value) || 0;
                    setWidth(w);
                    if (lockAspect && fileWidth > 0) setHeight(Math.round(w * fileHeight / fileWidth));
                  }}
                  className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 font-mono text-sm"
                />
              </div>
              <button onClick={() => setLockAspect(!lockAspect)} className="mt-5 p-2 rounded-md hover:bg-surface-hover text-muted-foreground">
                {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    setHeight(h);
                    if (lockAspect && fileHeight > 0) setWidth(Math.round(h * fileWidth / fileHeight));
                  }}
                  className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>

            <Button onClick={handleResize} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Resize to {width}×{height}
            </Button>
          </TabsContent>

          <TabsContent value="crop" className="space-y-4">
            <div className="rounded-lg bg-card border border-border p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Set crop dimensions</p>
              <div className="flex flex-wrap gap-2">
                {cropRatios.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => {
                      if (r.value) {
                        const cw = Math.min(fileWidth, Math.round(fileHeight * r.value));
                        const ch = Math.round(cw / r.value);
                        setCropW(cw); setCropH(ch);
                        setCropX(Math.round((fileWidth - cw) / 2));
                        setCropY(Math.round((fileHeight - ch) / 2));
                      }
                    }}
                    className="px-3 py-1.5 rounded-md text-sm border border-border bg-card hover:border-muted-foreground"
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Width', value: cropW, set: setCropW },
                  { label: 'Height', value: cropH, set: setCropH },
                  { label: 'X Offset', value: cropX, set: setCropX },
                  { label: 'Y Offset', value: cropY, set: setCropY },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs text-muted-foreground">{field.label}</label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.set(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              {cropW > 0 && cropH > 0 && (
                <p className="text-sm text-muted-foreground">Cropping to {cropW}×{cropH} from {fileWidth}×{fileHeight}</p>
              )}

              <Button onClick={handleCrop} disabled={isProcessing || !cropW || !cropH} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Crop Video
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <DownloadOutput />
      <ProcessingOverlay />
    </div>
  );
}
