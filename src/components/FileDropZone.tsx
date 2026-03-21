import { useCallback, useRef, useState } from 'react';
import { Upload, Film, X } from 'lucide-react';
import { useVideoStore } from '@/stores/videoStore';
import { formatBytes, formatTime } from '@/lib/ffmpeg';
import { motion, AnimatePresence } from 'framer-motion';

const ACCEPTED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/x-flv', 'video/3gpp'];

export function FileDropZone() {
  const { file, fileUrl, fileDuration, fileWidth, fileHeight, fileSize, fileName, setFile, clearFile } = useVideoStore();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('video/') && !ACCEPTED.some(t => f.type === t)) return;
    const url = URL.createObjectURL(f);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setFile(f, {
        url,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: f.size,
        name: f.name,
      });
    };
    video.src = url;
  }, [setFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  if (file && fileUrl) {
    return (
      <div className="rounded-lg bg-card border border-border p-4">
        <div className="flex items-start gap-4">
          <div className="w-40 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <video src={fileUrl} className="w-full h-full object-cover" muted />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{fileName}</p>
            <div className="flex gap-4 mt-1 text-sm text-muted-foreground font-mono">
              <span>{formatTime(fileDuration)}</span>
              <span>{fileWidth}×{fileHeight}</span>
              <span>{formatBytes(fileSize)}</span>
            </div>
          </div>
          <button onClick={clearFile} className="p-2 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 p-8 ${
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
        {dragging ? <Film className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
      </div>
      <div className="text-center">
        <p className="font-medium text-lg">{dragging ? 'Drop your video here' : 'Drop a video or click to browse'}</p>
        <p className="text-sm text-muted-foreground mt-1">MP4, MOV, AVI, MKV, WebM, FLV and more</p>
      </div>
    </motion.div>
  );
}
