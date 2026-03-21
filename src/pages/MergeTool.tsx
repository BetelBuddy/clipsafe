import { useState, useCallback, useRef } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { loadFFmpeg, fetchFile, formatBytes, formatTime } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical, AlertTriangle, CheckCircle } from 'lucide-react';

interface MergeFile {
  id: string;
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

export default function MergeTool() {
  const { isProcessing } = useVideoStore();
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList) => {
    Array.from(fileList).forEach((f) => {
      if (!f.type.startsWith('video/')) return;
      const url = URL.createObjectURL(f);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setFiles((prev) => [
          ...prev,
          { id: crypto.randomUUID(), file: f, url, duration: video.duration, width: video.videoWidth, height: video.videoHeight },
        ]);
      };
      video.src = url;
    });
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setFiles((prev) => {
      const newFiles = [...prev];
      const [moved] = newFiles.splice(dragIdx, 1);
      newFiles.splice(idx, 0, moved);
      return newFiles;
    });
    setDragIdx(idx);
  };

  const allSameRes = files.length > 1 && files.every((f) => f.width === files[0].width && f.height === files[0].height);
  const totalDuration = files.reduce((a, f) => a + f.duration, 0);

  const handleMerge = async () => {
    if (files.length < 2) return;
    const store = useVideoStore.getState();
    store.setProcessing(true, 'Merging videos...');

    const ffmpeg = await loadFFmpeg();

    // Write all files and build concat list
    let concatList = '';
    for (let i = 0; i < files.length; i++) {
      const name = `input${i}.mp4`;
      await ffmpeg.writeFile(name, await fetchFile(files[i].file));
      concatList += `file '${name}'\n`;
    }
    await ffmpeg.writeFile('list.txt', concatList);

    const args = allSameRes
      ? ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']
      : ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c:v', 'libx264', '-c:a', 'aac', '-vf', `scale=${files[0].width}:${files[0].height}`, 'output.mp4'];

    await ffmpeg.exec(args);
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Cleanup
    for (let i = 0; i < files.length; i++) {
      try { await ffmpeg.deleteFile(`input${i}.mp4`); } catch {}
    }
    try { await ffmpeg.deleteFile('list.txt'); } catch {}
    try { await ffmpeg.deleteFile('output.mp4'); } catch {}

    store.setOutput(url, blob.size, 'merged_video.mp4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Merge Videos</h1>
        <p className="text-sm text-muted-foreground mt-1">Join multiple videos into one</p>
      </div>

      {/* Drop zone */}
      <div
        className="rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-4 p-8"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
      >
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); }} />
        <Upload className="w-10 h-10 text-muted-foreground" />
        <p className="font-medium">Drop multiple videos here or click to browse</p>
        <p className="text-sm text-muted-foreground">They'll be merged in order — drag to reorder</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={f.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={() => setDragIdx(null)}
              className="flex items-center gap-3 rounded-lg bg-card border border-border p-3 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="w-20 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                <video src={f.url} className="w-full h-full object-cover" muted />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.file.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatTime(f.duration)} · {f.width}×{f.height} · {formatBytes(f.file.size)}
                </p>
              </div>
              <button onClick={() => removeFile(f.id)} className="p-1.5 rounded hover:bg-surface-hover text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Compatibility badge */}
          {files.length >= 2 && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${allSameRes ? 'bg-green-500/10 text-green-400' : 'bg-secondary/10 text-secondary'}`}>
              {allSameRes ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {allSameRes ? '✓ All files are compatible' : '⚠️ Different resolutions — will re-encode to match'}
            </div>
          )}

          {/* Timeline preview */}
          <div className="rounded-lg bg-card border border-border p-4">
            <div className="flex gap-1 h-8">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="bg-primary/20 border border-primary/40 rounded-sm flex items-center justify-center text-xs font-mono text-muted-foreground overflow-hidden"
                  style={{ flex: f.duration }}
                >
                  {formatTime(f.duration)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total: {formatTime(totalDuration)}</p>
          </div>

          <Button
            onClick={handleMerge}
            disabled={isProcessing || files.length < 2}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Merge {files.length} Videos
          </Button>
        </div>
      )}

      <DownloadOutput />
      <ProcessingOverlay />
    </div>
  );
}
