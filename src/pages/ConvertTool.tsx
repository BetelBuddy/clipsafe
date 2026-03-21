import { useState } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';

const formats = [
  { id: 'mp4', label: 'MP4', desc: 'Universal — works everywhere', ext: 'mp4', args: ['-c:v', 'libx264', '-c:a', 'aac'] },
  { id: 'webm', label: 'WebM', desc: 'Web optimized', ext: 'webm', args: ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'] },
  { id: 'mp3', label: 'MP3', desc: 'Audio only — extract soundtrack', ext: 'mp3', args: ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k'] },
  { id: 'wav', label: 'WAV', desc: 'Lossless audio', ext: 'wav', args: ['-vn'] },
  { id: 'gif', label: 'GIF', desc: 'Animated, no audio', ext: 'gif', args: ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'] },
];

export default function ConvertTool() {
  const { file, fileUrl, isProcessing } = useVideoStore();
  const [format, setFormat] = useState('mp4');

  const handleConvert = async () => {
    if (!file) return;
    const fmt = formats.find((f) => f.id === format)!;
    const outName = `output.${fmt.ext}`;
    const args = ['-i', 'input', ...fmt.args, outName];
    useVideoStore.getState().setProcessing(true, `Converting to ${fmt.label}...`);
    await runFFmpegCommand(file, args, outName);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Convert Video</h1>
        <p className="text-sm text-muted-foreground mt-1">Change format to MP4, WebM, GIF and more</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`text-left rounded-lg border p-4 transition-all ${
                  format === f.id
                    ? 'border-primary bg-primary/5 shadow-glow-primary'
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <p className="font-bold text-lg">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </button>
            ))}
          </div>

          {format === 'gif' && (
            <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 text-sm text-secondary">
              ⚠️ GIFs can be large. Consider keeping it short or choosing WebM instead.
            </div>
          )}

          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Convert to {formats.find((f) => f.id === format)?.label}
          </Button>

          <DownloadOutput />
        </>
      )}

      <ProcessingOverlay />
    </div>
  );
}
