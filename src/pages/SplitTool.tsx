import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand, formatTime, triggerDownload } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function SplitTool() {
  const { file, fileDuration, isProcessing } = useVideoStore();
  const [mode, setMode] = useState<'equal' | 'duration'>('equal');
  const [parts, setParts] = useState(2);
  const [segmentDuration, setSegmentDuration] = useState(30);
  const [segments, setSegments] = useState<{ url: string; name: string; size: number }[]>([]);

  const handleSplit = async () => {
    if (!file) return;
    const results: { url: string; name: string; size: number }[] = [];
    const segDur = mode === 'equal' ? fileDuration / parts : segmentDuration;
    const numSegs = mode === 'equal' ? parts : Math.ceil(fileDuration / segmentDuration);

    for (let i = 0; i < numSegs; i++) {
      const start = i * segDur;
      const end = Math.min((i + 1) * segDur, fileDuration);
      if (start >= fileDuration) break;

      const outName = `segment_${i + 1}.mp4`;
      const result = await runFFmpegCommand(
        file,
        ['-ss', String(start), '-to', String(end), '-i', 'input', '-c', 'copy', outName],
        outName
      );
      results.push({ url: result.url, name: outName, size: result.size });
    }
    setSegments(results);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">Video Splitter</h1>
        <p className="text-muted-foreground mt-1">Split a video into equal parts or by time duration</p>
      </div>

      <FileDropZone />

      {file && segments.length === 0 && (
        <div className="space-y-4 rounded-lg bg-card border border-border p-6">
          <div className="flex gap-2">
            <button onClick={() => setMode('equal')}
              className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                mode === 'equal' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}>
              Equal Parts
            </button>
            <button onClick={() => setMode('duration')}
              className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                mode === 'duration' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}>
              By Duration
            </button>
          </div>

          {mode === 'equal' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Number of parts: {parts}</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 10].map(n => (
                  <button key={n} onClick={() => setParts(n)}
                    className={cn('px-3 py-1.5 rounded-md text-sm border',
                      parts === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    )}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Each segment: ~{formatTime(fileDuration / parts)}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Segment duration (seconds)</label>
              <input type="number" min={1} max={fileDuration} value={segmentDuration}
                onChange={e => setSegmentDuration(Number(e.target.value))}
                className="w-28 bg-muted border border-border rounded px-2 py-1 text-sm font-mono-tech" />
              <p className="text-sm text-muted-foreground mt-2">
                Will create ~{Math.ceil(fileDuration / segmentDuration)} segments
              </p>
            </div>
          )}

          <Button onClick={handleSplit} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Split Video
          </Button>
        </div>
      )}

      {segments.length > 0 && (
        <div className="rounded-lg bg-card border border-border p-6 space-y-3">
          <p className="font-medium text-green-400">✓ Split into {segments.length} segments</p>
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm font-mono-tech">Segment {i + 1}</span>
              <Button size="sm" variant="outline" onClick={() => triggerDownload(seg.url, seg.name)}>
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setSegments([])} className="w-full mt-2">
            Split Another
          </Button>
        </div>
      )}
    </div>
  );
}
