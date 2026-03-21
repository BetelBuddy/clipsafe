import { useState, useRef, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand, formatBytes, formatTime, loadFFmpeg, fetchFile } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Gauge, Camera, FileText, Upload } from 'lucide-react';

export default function UtilitiesTool() {
  const { file, fileUrl, fileDuration, fileWidth, fileHeight, fileSize, fileName, isProcessing } = useVideoStore();
  const [speed, setSpeed] = useState(1);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPos, setWatermarkPos] = useState('br');
  const videoRef = useRef<HTMLVideoElement>(null);
  const wmRef = useRef<HTMLInputElement>(null);

  const rotate = async (filter: string, label: string) => {
    if (!file) return;
    useVideoStore.getState().setProcessing(true, label);
    await runFFmpegCommand(file, ['-i', 'input', '-vf', filter, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4'], 'output.mp4');
  };

  const changeSpeed = async () => {
    if (!file) return;
    useVideoStore.getState().setProcessing(true, `Changing speed to ${speed}x...`);
    const pts = (1 / speed).toFixed(4);
    const atempo = speed > 2 ? `atempo=2.0,atempo=${(speed / 2).toFixed(4)}` : `atempo=${speed.toFixed(4)}`;
    await runFFmpegCommand(file,
      ['-i', 'input', '-filter_complex', `[0:v]setpts=${pts}*PTS[v];[0:a]${atempo}[a]`, '-map', '[v]', '-map', '[a]', 'output.mp4'],
      'output.mp4'
    );
  };

  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frame_${Math.floor(v.currentTime)}s.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const addWatermark = async () => {
    if (!file || !watermarkFile) return;
    const store = useVideoStore.getState();
    store.setProcessing(true, 'Adding watermark...');
    const ffmpeg = await loadFFmpeg();
    await ffmpeg.writeFile('input', await fetchFile(file));
    await ffmpeg.writeFile('wm.png', await fetchFile(watermarkFile));
    const posMap: Record<string, string> = {
      tl: '20:20', tc: '(W-w)/2:20', tr: 'W-w-20:20',
      ml: '20:(H-h)/2', mc: '(W-w)/2:(H-h)/2', mr: 'W-w-20:(H-h)/2',
      bl: '20:H-h-20', bc: '(W-w)/2:H-h-20', br: 'W-w-20:H-h-20',
    };
    await ffmpeg.exec(['-i', 'input', '-i', 'wm.png', '-filter_complex', `[1:v]scale=iw/4:-1[wm];[0:v][wm]overlay=${posMap[watermarkPos]}`, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    try { await ffmpeg.deleteFile('input'); } catch (e) { /* Intentionally empty */ }
    try { await ffmpeg.deleteFile('wm.png'); } catch (e) { /* Intentionally empty */ }
    try { await ffmpeg.deleteFile('output.mp4'); } catch (e) { /* Intentionally empty */ }
    store.setOutput(url, blob.size, 'watermarked_video.mp4');
  };

  const stripMetadata = async () => {
    if (!file) return;
    useVideoStore.getState().setProcessing(true, 'Stripping metadata...');
    await runFFmpegCommand(file, ['-i', 'input', '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', 'output.mp4'], 'output.mp4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Video Utilities</h1>
        <p className="text-sm text-muted-foreground mt-1">Rotate, speed, screenshot, watermark and more</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <>
          {/* Video preview for screenshot */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="aspect-video">
              <video ref={videoRef} src={fileUrl} className="w-full h-full" controls />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rotate & Flip */}
            <div className="rounded-lg bg-card border border-border p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><RotateCw className="w-4 h-4 text-primary" /> Rotate & Flip</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => rotate('transpose=1', 'Rotating 90° CW...')} disabled={isProcessing} className="border-border text-sm">90° CW</Button>
                <Button variant="outline" size="sm" onClick={() => rotate('transpose=2', 'Rotating 90° CCW...')} disabled={isProcessing} className="border-border text-sm">90° CCW</Button>
                <Button variant="outline" size="sm" onClick={() => rotate('transpose=1,transpose=1', 'Rotating 180°...')} disabled={isProcessing} className="border-border text-sm">180°</Button>
                <Button variant="outline" size="sm" onClick={() => rotate('hflip', 'Flipping horizontal...')} disabled={isProcessing} className="border-border text-sm">Flip H</Button>
              </div>
            </div>

            {/* Speed Changer */}
            <div className="rounded-lg bg-card border border-border p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> Speed Changer</h3>
              <div className="flex items-center gap-3">
                <input type="range" min={0.25} max={4} step={0.25} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="flex-1" style={{ accentColor: 'hsl(0 100% 62%)' }} />
                <span className="font-mono text-sm w-12 text-right">{speed}x</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {[0.5, 1, 1.5, 2, 3, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded text-xs border ${speed === s ? 'border-primary bg-primary/5' : 'border-border'}`}>{s}x</button>
                ))}
              </div>
              <Button onClick={changeSpeed} disabled={isProcessing || speed === 1} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                Apply {speed}x Speed
              </Button>
            </div>

            {/* Screenshot Extractor */}
            <div className="rounded-lg bg-card border border-border p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4 text-primary" /> Screenshot</h3>
              <p className="text-sm text-muted-foreground">Seek the video above to the frame you want, then capture.</p>
              <Button onClick={captureFrame} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                Capture Current Frame
              </Button>
            </div>

            {/* Metadata */}
            <div className="rounded-lg bg-card border border-border p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Metadata</h3>
              <div className="text-sm space-y-1 font-mono text-muted-foreground">
                <p>File: {fileName}</p>
                <p>Duration: {formatTime(fileDuration)}</p>
                <p>Resolution: {fileWidth}×{fileHeight}</p>
                <p>Size: {formatBytes(fileSize)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={stripMetadata} disabled={isProcessing} className="w-full border-border text-sm">
                Strip All Metadata
              </Button>
            </div>

            {/* Watermark */}
            <div className="rounded-lg bg-card border border-border p-5 space-y-3 md:col-span-2">
              <h3 className="font-semibold flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> Watermark</h3>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-3">
                  <div
                    className="rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer p-4 flex items-center gap-2"
                    onClick={() => wmRef.current?.click()}
                  >
                    <input ref={wmRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setWatermarkFile(e.target.files[0]); }} />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{watermarkFile ? watermarkFile.name : 'Upload watermark image (PNG)'}</span>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Position</label>
                    <div className="grid grid-cols-3 gap-1 w-24">
                      {['tl','tc','tr','ml','mc','mr','bl','bc','br'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setWatermarkPos(pos)}
                          className={`w-7 h-7 rounded text-xs border ${watermarkPos === pos ? 'border-primary bg-primary/10' : 'border-border bg-surface-elevated'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={addWatermark} disabled={isProcessing || !watermarkFile} className="bg-primary hover:bg-primary/90 text-primary-foreground mt-6">
                  Add Watermark
                </Button>
              </div>
            </div>
          </div>

          <DownloadOutput />
        </>
      )}

      <ProcessingOverlay />
    </div>
  );
}
