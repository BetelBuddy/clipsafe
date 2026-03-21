import { useState, useRef, useEffect } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand, loadFFmpeg, fetchFile } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download } from 'lucide-react';

interface Subtitle {
  id: number;
  start: number;
  end: number;
  text: string;
}

function parseSRT(text: string): Subtitle[] {
  const blocks = text.trim().split(/\n\n+/);
  return blocks.map((block) => {
    const lines = block.split('\n');
    if (lines.length < 3) return null;
    const id = parseInt(lines[0]);
    const times = lines[1].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
    if (!times) return null;
    const start = +times[1]*3600 + +times[2]*60 + +times[3] + +times[4]/1000;
    const end = +times[5]*3600 + +times[6]*60 + +times[7] + +times[8]/1000;
    const text = lines.slice(2).join('\n');
    return { id, start, end, text };
  }).filter(Boolean) as Subtitle[];
}

export default function SubtitlesTool() {
  const { file, fileUrl, isProcessing } = useVideoStore();
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [srtText, setSrtText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [fontSize, setFontSize] = useState('24');
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSrtUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSrtText(text);
      setSubtitles(parseSRT(text));
    };
    reader.readAsText(f);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [fileUrl]);

  const activeSub = subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);

  const handleBurnIn = async () => {
    if (!file || !srtText) return;
    const store = useVideoStore.getState();
    store.setProcessing(true, 'Burning subtitles...');
    const ffmpeg = await loadFFmpeg();
    await ffmpeg.writeFile('input', await fetchFile(file));
    await ffmpeg.writeFile('subs.srt', srtText);
    await ffmpeg.exec(['-i', 'input', '-vf', `subtitles=subs.srt:force_style='FontSize=${fontSize}'`, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    try { await ffmpeg.deleteFile('input'); } catch {}
    try { await ffmpeg.deleteFile('subs.srt'); } catch {}
    try { await ffmpeg.deleteFile('output.mp4'); } catch {}
    store.setOutput(url, blob.size, 'subtitled_video.mp4');
  };

  const exportSrt = () => {
    if (!srtText) return;
    const blob = new Blob([srtText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subtitles.srt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Subtitles & Captions</h1>
        <p className="text-sm text-muted-foreground mt-1">Add captions and subtitles to your video</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <div className="space-y-4">
          {/* Video preview with subtitle overlay */}
          <div className="rounded-lg bg-card border border-border overflow-hidden relative">
            <div className="aspect-video relative">
              <video ref={videoRef} src={fileUrl} className="w-full h-full" controls />
              {activeSub && (
                <div className={`absolute left-0 right-0 flex justify-center px-4 ${position === 'bottom' ? 'bottom-12' : 'top-4'}`}>
                  <span className="bg-background/80 px-4 py-2 rounded text-foreground text-center" style={{ fontSize: `${fontSize}px` }}>
                    {activeSub.text}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload SRT */}
          <div
            className="rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer p-6 flex flex-col items-center gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".srt,.vtt" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleSrtUpload(e.target.files[0]); }} />
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm">{subtitles.length > 0 ? `${subtitles.length} subtitles loaded` : 'Upload .SRT or .VTT subtitle file'}</p>
          </div>

          {subtitles.length > 0 && (
            <>
              {/* Style options */}
              <div className="rounded-lg bg-card border border-border p-4 space-y-3">
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Font Size</label>
                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm">
                      <option value="16">Small</option>
                      <option value="24">Medium</option>
                      <option value="32">Large</option>
                      <option value="42">XL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Position</label>
                    <select value={position} onChange={(e) => setPosition(e.target.value as 'bottom' | 'top')} className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm">
                      <option value="bottom">Bottom</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBurnIn} disabled={isProcessing} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Burn Subtitles into Video
                </Button>
                <Button variant="outline" onClick={exportSrt} className="border-border">
                  <Download className="w-4 h-4 mr-2" /> Export .SRT
                </Button>
              </div>
            </>
          )}

          <DownloadOutput />
        </div>
      )}

      <ProcessingOverlay />
    </div>
  );
}
