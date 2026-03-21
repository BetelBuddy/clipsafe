import { useState, useRef } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand, formatTimecode, formatTime } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

export default function TrimTool() {
  const { file, fileUrl, fileDuration, isProcessing } = useVideoStore();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fastTrim, setFastTrim] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set endTime to duration when file loads
  const onLoaded = () => {
    if (videoRef.current) {
      setEndTime(videoRef.current.duration);
      setStartTime(0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const handleTrim = async () => {
    if (!file) return;
    const ext = file.name.split('.').pop() || 'mp4';
    const outName = `output.${ext}`;
    const ss = formatTimecode(startTime);
    const to = formatTimecode(endTime);

    const args = fastTrim
      ? ['-ss', ss, '-to', to, '-i', 'input', '-c', 'copy', outName]
      : ['-ss', ss, '-to', to, '-i', 'input', '-c:v', 'libx264', '-c:a', 'aac', outName];

    useVideoStore.getState().setProcessing(true, 'Trimming video...');
    await runFFmpegCommand(file, args, outName);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Trim Video</h1>
        <p className="text-sm text-muted-foreground mt-1">Cut your video to the perfect length</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <>
          {/* Video Preview */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="aspect-video bg-muted">
              <video
                ref={videoRef}
                src={fileUrl}
                className="w-full h-full"
                onLoadedMetadata={onLoaded}
                onEnded={() => setPlaying(false)}
              />
            </div>
            <div className="p-3 flex items-center gap-4 border-t border-border">
              <button onClick={togglePlay} className="p-2 rounded-md hover:bg-surface-elevated transition-colors">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-sm font-mono text-muted-foreground">{formatTime(fileDuration)}</span>
            </div>
          </div>

          {/* Timeline / Range */}
          <div className="rounded-lg bg-card border border-border p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Start Time</label>
              <input
                type="range"
                min={0}
                max={fileDuration}
                step={0.1}
                value={startTime}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setStartTime(Math.min(v, endTime - 0.1));
                  if (videoRef.current) videoRef.current.currentTime = v;
                }}
                className="w-full accent-primary"
                style={{ accentColor: 'hsl(0 100% 62%)' }}
              />
              <div className="flex items-center justify-between text-sm font-mono">
                <span>{formatTimecode(startTime)}</span>
                <span className="text-muted-foreground">Duration: {formatTime(endTime - startTime)}</span>
                <span>{formatTimecode(endTime)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End Time</label>
              <input
                type="range"
                min={0}
                max={fileDuration}
                step={0.1}
                value={endTime}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setEndTime(Math.max(v, startTime + 0.1));
                  if (videoRef.current) videoRef.current.currentTime = v;
                }}
                className="w-full"
                style={{ accentColor: 'hsl(0 100% 62%)' }}
              />
            </div>

            {/* Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastTrim}
                  onChange={(e) => setFastTrim(e.target.checked)}
                  className="rounded accent-primary"
                />
                Fast trim (no re-encode)
              </label>
            </div>

            <Button
              onClick={handleTrim}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Trim Video
            </Button>
          </div>

          <DownloadOutput />
        </>
      )}

      <ProcessingOverlay />
    </div>
  );
}
