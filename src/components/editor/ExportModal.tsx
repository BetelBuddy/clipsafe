import { useState, useMemo } from 'react';
import { X, Download, Loader2, Captions, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEditorStore } from '@/stores/editorStore';
import { useCaptionsStore } from '@/stores/captionsStore';
import { useVideoStore } from '@/stores/videoStore';
import { loadFFmpeg, fetchFile, triggerDownload } from '@/lib/ffmpeg';
import { buildExportArgs, getExportSummary, DEFAULT_CAPTION_STYLE } from '@/lib/exportPipeline';
import { Progress } from '@/components/ui/progress';

interface Props { onClose: () => void; }

import { BatchExportModal } from './BatchExportModal';

export function ExportModal({ onClose }: Props) {
  const [showBatch, setShowBatch] = useState(false);
  const { clips, mediaFiles, tracks } = useEditorStore();
  const { segments: captions } = useCaptionsStore();
  const { processingProgress: progress } = useVideoStore();
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [resolution, setResolution] = useState('original');
  const [burnCaptions, setBurnCaptions] = useState(captions.length > 0);
  const [exporting, setExporting] = useState(false);

  const clipList = useMemo(() => Object.values(clips), [clips]);
  const firstClip = clipList[0];
  const media = firstClip ? mediaFiles.find((m) => m.id === firstClip.sourceFileId) : null;

  const exportOptions = useMemo(() => ({
    clips: clipList,
    format,
    quality,
    resolution,
    burnCaptions,
    captions,
    captionStyle: DEFAULT_CAPTION_STYLE,
    mediaDuration: media?.duration,
  }), [clipList, format, quality, resolution, burnCaptions, captions, media]);

  const summary = useMemo(() => getExportSummary(exportOptions), [exportOptions]);

  if (showBatch) return <BatchExportModal onClose={onClose} />;

  const handleExport = async () => {
    if (clipList.length === 0 || !media) return;

    setExporting(true);
    try {
      const ffmpeg = await loadFFmpeg();
      await ffmpeg.writeFile('input', await fetchFile(media.file));

      const { args, outputFileName } = buildExportArgs(exportOptions);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data as unknown as BlobPart], { type: `video/${format}` });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `export.${format}`);

      try { await ffmpeg.deleteFile('input'); } catch {}
      try { await ffmpeg.deleteFile(outputFileName); } catch {}
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-cinematic w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Export Project</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="mov">MOV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (smaller file)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="lossless">Lossless</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Resolution</label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="1920x1080">1080p</SelectItem>
                <SelectItem value="1280x720">720p</SelectItem>
                <SelectItem value="854x480">480p</SelectItem>
                <SelectItem value="640x360">360p</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Burn Captions Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Captions className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-xs font-medium">Burn Captions</span>
                {captions.length > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {captions.reduce((n, s) => n + s.words.filter(w => !w.deleted).length, 0)} words
                  </span>
                )}
              </div>
            </div>
            <Switch
              checked={burnCaptions}
              onCheckedChange={setBurnCaptions}
              disabled={captions.length === 0}
            />
          </div>
        </div>

        {/* Export summary */}
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div>{clipList.length} clip(s) · {tracks.length} track(s)</div>
          {summary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {summary.map((item, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {exporting && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <span className="text-[10px] text-muted-foreground">Exporting... {progress}%</span>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowBatch(true)} disabled={exporting} className="gap-1 mr-auto">
            <Layers className="w-3 h-3" /> Batch Export
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>Cancel</Button>
          <Button size="sm" onClick={handleExport} disabled={exporting || clipList.length === 0} className="gap-1">
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
