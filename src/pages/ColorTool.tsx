import { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const filters = [
  { label: 'Grayscale', value: 'hue=s=0' },
  { label: 'Sepia', value: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131' },
  { label: 'Negative', value: 'negate' },
  { label: 'Vintage', value: 'curves=vintage' },
];

export default function ColorTool() {
  const { file, outputUrl, isProcessing } = useVideoStore();
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleApply = async () => {
    if (!file) return;
    const parts: string[] = [];
    if (brightness !== 0 || contrast !== 1) {
      parts.push(`eq=brightness=${brightness}:contrast=${contrast}`);
    }
    if (saturation !== 1) {
      parts.push(`hue=s=${saturation}`);
    }
    if (selectedFilter) {
      parts.push(selectedFilter);
    }

    const vf = parts.length > 0 ? parts.join(',') : 'null';
    await runFFmpegCommand(file, ['-i', 'input', '-vf', vf, '-c:a', 'copy', 'output.mp4'], 'output.mp4');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <ProcessingOverlay />
      <div>
        <h1 className="text-2xl font-bold">Color & Brightness</h1>
        <p className="text-muted-foreground mt-1">Adjust brightness, contrast, saturation or apply color filters</p>
      </div>

      <FileDropZone />

      {file && !outputUrl && (
        <div className="space-y-6 rounded-lg bg-card border border-border p-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Brightness: {brightness > 0 ? '+' : ''}{brightness.toFixed(2)}</label>
            <Slider min={-0.5} max={0.5} step={0.05} value={[brightness]} onValueChange={v => setBrightness(v[0])} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contrast: {contrast.toFixed(1)}×</label>
            <Slider min={0.5} max={2} step={0.1} value={[contrast]} onValueChange={v => setContrast(v[0])} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Saturation: {saturation.toFixed(1)}×</label>
            <Slider min={0} max={3} step={0.1} value={[saturation]} onValueChange={v => setSaturation(v[0])} />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Color Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter(null)}
                className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                  !selectedFilter ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                )}>
                None
              </button>
              {filters.map(f => (
                <button key={f.label} onClick={() => setSelectedFilter(f.value)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-colors',
                    selectedFilter === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleApply} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Apply Adjustments
          </Button>
        </div>
      )}

      <DownloadOutput />
    </div>
  );
}
