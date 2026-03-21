import { useState, useMemo } from 'react';
import { X, Download, Loader2, Check, Youtube, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useEditorStore } from '@/stores/editorStore';
import { useCaptionsStore } from '@/stores/captionsStore';
import { useVideoStore } from '@/stores/videoStore';
import { loadFFmpeg, fetchFile, triggerDownload } from '@/lib/ffmpeg';
import { buildExportArgs, DEFAULT_CAPTION_STYLE } from '@/lib/exportPipeline';
import { cn } from '@/lib/utils';

interface Props { onClose: () => void; }

interface PlatformConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  aspect: string;
  format: string;
  color: string;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, width: 1920, height: 1080, aspect: '16:9', format: 'mp4', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'tiktok', label: 'TikTok', icon: <span className="text-[10px] font-bold">TT</span>, width: 1080, height: 1920, aspect: '9:16', format: 'mp4', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, width: 1080, height: 1080, aspect: '1:1', format: 'mp4', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'twitter', label: 'Twitter / X', icon: <Twitter className="w-4 h-4" />, width: 1280, height: 720, aspect: '16:9', format: 'mp4', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'reels', label: 'IG Reels', icon: <Instagram className="w-4 h-4" />, width: 1080, height: 1920, aspect: '9:16', format: 'mp4', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

type ExportStatus = 'pending' | 'exporting' | 'done' | 'error';

export function BatchExportModal({ onClose }: Props) {
  const { clips, mediaFiles } = useEditorStore();
  const { segments: captions } = useCaptionsStore();
  const { processingProgress } = useVideoStore();
  
  const [selected, setSelected] = useState<Set<string>>(new Set(['youtube']));
  const [burnCaptions, setBurnCaptions] = useState(captions.length > 0);
  const [exporting, setExporting] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const [currentPlatform, setCurrentPlatform] = useState('');

  const clipList = useMemo(() => Object.values(clips), [clips]);
  const firstClip = clipList[0];
  const media = firstClip ? mediaFiles.find((m) => m.id === firstClip.sourceFileId) : null;

  const togglePlatform = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchExport = async () => {
    if (!media || clipList.length === 0 || selected.size === 0) return;
    setExporting(true);

    const platforms = PLATFORMS.filter(p => selected.has(p.id));
    const initialStatuses: Record<string, ExportStatus> = {};
    platforms.forEach(p => { initialStatuses[p.id] = 'pending'; });
    setStatuses(initialStatuses);

    try {
      const ffmpeg = await loadFFmpeg();
      await ffmpeg.writeFile('input', await fetchFile(media.file));

      for (const platform of platforms) {
        setCurrentPlatform(platform.id);
        setStatuses(prev => ({ ...prev, [platform.id]: 'exporting' }));

        try {
          const resolution = `${platform.width}x${platform.height}`;
          const { args, outputFileName } = buildExportArgs({
            clips: clipList,
            format: platform.format,
            quality: 'high',
            resolution,
            burnCaptions,
            captions,
            captionStyle: DEFAULT_CAPTION_STYLE,
            mediaDuration: media.duration,
          });

          await ffmpeg.exec(args);
          const data = await ffmpeg.readFile(outputFileName);
          const blob = new Blob([data as unknown as BlobPart], { type: `video/${platform.format}` });
          const url = URL.createObjectURL(blob);
          triggerDownload(url, `export-${platform.id}.${platform.format}`);
          
          try { await ffmpeg.deleteFile(outputFileName); } catch {}
          setStatuses(prev => ({ ...prev, [platform.id]: 'done' }));
        } catch (err) {
          console.error(`Export failed for ${platform.label}:`, err);
          setStatuses(prev => ({ ...prev, [platform.id]: 'error' }));
        }
      }

      try { await ffmpeg.deleteFile('input'); } catch {}
    } catch (err) {
      console.error('Batch export failed:', err);
    } finally {
      setExporting(false);
      setCurrentPlatform('');
    }
  };

  const allDone = Object.values(statuses).length > 0 && Object.values(statuses).every(s => s === 'done' || s === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-cinematic w-full max-w-lg p-6 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Multi-Platform Export</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Export your video to multiple platforms at once. Each format will be auto-reframed.
        </p>

        {/* Platform selection */}
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => !exporting && togglePlatform(p.id)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                selected.has(p.id) ? p.color + ' border' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50',
                exporting && 'pointer-events-none',
              )}
            >
              {p.icon}
              <div className="flex-1">
                <div className="text-xs font-medium">{p.label}</div>
                <div className="text-[10px] opacity-60">{p.width}×{p.height} ({p.aspect})</div>
              </div>
              {statuses[p.id] === 'done' && <Check className="w-4 h-4 text-green-400" />}
              {statuses[p.id] === 'exporting' && <Loader2 className="w-4 h-4 animate-spin" />}
              {statuses[p.id] === 'error' && <X className="w-4 h-4 text-destructive" />}
            </button>
          ))}
        </div>

        {/* Burn captions */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs">Burn Captions</span>
          <Switch checked={burnCaptions} onCheckedChange={setBurnCaptions} disabled={captions.length === 0} />
        </div>

        {/* Progress */}
        {exporting && currentPlatform && (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">
              Exporting {PLATFORMS.find(p => p.id === currentPlatform)?.label}...
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>
            {allDone ? 'Done' : 'Cancel'}
          </Button>
          {!allDone && (
            <Button size="sm" onClick={handleBatchExport} disabled={exporting || selected.size === 0 || clipList.length === 0} className="gap-1">
              {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export {selected.size} Format{selected.size > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
