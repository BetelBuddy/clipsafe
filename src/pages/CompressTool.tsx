import { useState } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand, formatBytes } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';

const presets = [
  { id: 'max', label: '🏆 Maximum Quality', desc: '~40% smaller, barely noticeable loss', crf: '22', scale: '', abr: '192k' },
  { id: 'balanced', label: '⚖️ Balanced', desc: '~60% smaller, good quality', crf: '28', scale: '', abr: '128k' },
  { id: 'social', label: '📱 Social Media', desc: '~75% smaller, perfect for sharing', crf: '32', scale: 'scale=-2:720,', abr: '96k' },
  { id: 'tiny', label: '💾 Max Compression', desc: '~85% smaller, some quality loss', crf: '38', scale: 'scale=-2:480,', abr: '64k' },
];

export default function CompressTool() {
  const { file, fileUrl, fileSize, isProcessing } = useVideoStore();
  const [preset, setPreset] = useState('balanced');

  const handleCompress = async () => {
    if (!file) return;
    const p = presets.find((x) => x.id === preset)!;
    const vf = p.scale ? ['-vf', p.scale.replace(/,$/, '')] : [];
    const args = ['-i', 'input', '-c:v', 'libx264', '-crf', p.crf, '-preset', 'medium', ...vf, '-c:a', 'aac', '-b:a', p.abr, 'output.mp4'];
    useVideoStore.getState().setProcessing(true, 'Compressing video...');
    await runFFmpegCommand(file, args, 'output.mp4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Compress Video</h1>
        <p className="text-sm text-muted-foreground mt-1">Shrink file size without losing quality</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <>
          <div className="rounded-lg bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">Original size: <span className="font-mono text-foreground">{formatBytes(fileSize)}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`text-left rounded-lg border p-4 transition-all ${
                  preset === p.id
                    ? 'border-primary bg-primary/5 shadow-glow-primary'
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <p className="font-medium">{p.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </button>
            ))}
          </div>

          <Button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Compress Video
          </Button>

          <DownloadOutput />
        </>
      )}

      <ProcessingOverlay />
    </div>
  );
}
