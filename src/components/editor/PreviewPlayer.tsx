import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useCaptionsStore } from '@/stores/captionsStore';
import { useKeyframeStore } from '@/stores/keyframeStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize, Upload, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTimecode } from '@/lib/ffmpeg';
import { buildMediaFile } from '@/lib/mediaImport';
import { CaptionOverlay } from './CaptionOverlay';
import { DEFAULT_CAPTION_STYLE, type CaptionStyle } from '@/lib/captionStyles';
import { CaptionPropertiesPanel } from './CaptionPropertiesPanel';

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

/** Renders live text overlays from clip filters on top of the video */
function TextOverlays({ clipId }: { clipId: string }) {
  const clip = useEditorStore((s) => s.clips[clipId]);
  if (!clip) return null;

  const textFilters = clip.filters.filter((f) => f.type === 'text-overlay');
  if (textFilters.length === 0) return null;

  return (
    <>
      {textFilters.map((f) => {
        const text = (f.params.text as string) || '';
        const x = (f.params.x as number) ?? 50;
        const y = (f.params.y as number) ?? 400;
        const fontSize = (f.params.fontSize as number) ?? 24;
        const color = (f.params.color as string) || 'white';

        return (
          <div
            key={f.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${Math.min(Math.max(x, 0), 100)}%`,
              top: `${Math.min(Math.max(y, 0), 100)}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${Math.min(Math.max(fontSize, 8), 120)}px`,
              color,
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
}

/** Interpolates keyframed properties and applies them to video wrapper */
function useKeyframeInterpolation(clipId: string | null, playhead: number) {
  const { getInterpolatedValue, getClipKeyframes } = useKeyframeStore();
  if (!clipId) return {};

  const kfs = getClipKeyframes(clipId);
  if (kfs.length === 0) return {};

  const props: Record<string, number> = {};
  const properties = [...new Set(kfs.map(k => k.property))];
  for (const prop of properties) {
    props[prop] = getInterpolatedValue(clipId, prop, playhead);
  }
  return props;
}

export function PreviewPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const { playhead, setPlayhead, isPlaying, setPlaying, mediaFiles, playbackRate, setPlaybackRate, importAndAddToTimeline, selection, clips } = useEditorStore();
  const hasCaptions = useCaptionsStore((s) => s.segments.length > 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoMeta, setVideoMeta] = useState<{ w: number; h: number; dur: number } | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(DEFAULT_CAPTION_STYLE);
  const [showCaptionProps, setShowCaptionProps] = useState(false);

  const firstVideo = mediaFiles.find((f) => f.type === 'video');
  const src = firstVideo?.url;

  const selectedClipId = selection.length === 1 ? selection[0] : null;
  const hasTextOverlays = selectedClipId && clips[selectedClipId]?.filters.some(f => f.type === 'text-overlay');

  // Keyframe interpolation
  const kfProps = useKeyframeInterpolation(selectedClipId, playhead);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.play().catch(() => { });
    else v.pause();
  }, [isPlaying]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || isPlaying || scrubbing) return;
    if (Math.abs(v.currentTime - playhead) > 0.05) v.currentTime = playhead;
  }, [playhead, isPlaying, scrubbing]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) { v.volume = muted ? 0 : volume; }
  }, [volume, muted]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && isPlaying && !scrubbing) setPlayhead(v.currentTime);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setVideoMeta({ w: v.videoWidth, h: v.videoHeight, dur: v.duration });
  };

  const handleScrub = useCallback((values: number[]) => {
    const time = values[0];
    setScrubbing(true);
    setPlayhead(time);
    const v = videoRef.current;
    if (v) v.currentTime = time;
  }, [setPlayhead]);

  const handleScrubEnd = useCallback(() => { setScrubbing(false); }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
      return;
    }

    // Target the video element directly for native fullscreen — zero black bars
    const target = videoRef.current || videoAreaRef.current;
    if (!target) return;

    target.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
      // Fallback to container if video element fullscreen fails
      videoAreaRef.current?.requestFullscreen().catch(() => { });
    });
  }, []);

  const handleImportFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const media = await buildMediaFile(file);
      importAndAddToTimeline(media);
    }
  }, [importAndAddToTimeline]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleImportFiles(e.dataTransfer.files);
  }, [handleImportFiles]);

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const aspectRatio = videoMeta ? `${Math.round(videoMeta.w / gcd(videoMeta.w, videoMeta.h))}:${Math.round(videoMeta.h / gcd(videoMeta.w, videoMeta.h))}` : '';
  const totalDuration = videoMeta?.dur || 0;

  // Build transform from keyframe properties
  const videoTransformStyle: React.CSSProperties = {};
  if (Object.keys(kfProps).length > 0) {
    const transforms: string[] = [];
    if (kfProps.positionX !== undefined || kfProps.positionY !== undefined) {
      transforms.push(`translate(${kfProps.positionX ?? 0}px, ${kfProps.positionY ?? 0}px)`);
    }
    if (kfProps.scale !== undefined) transforms.push(`scale(${kfProps.scale})`);
    if (kfProps.rotation !== undefined) transforms.push(`rotate(${kfProps.rotation}deg)`);
    if (transforms.length > 0) videoTransformStyle.transform = transforms.join(' ');
    if (kfProps.opacity !== undefined) videoTransformStyle.opacity = kfProps.opacity;
    if (kfProps.blur !== undefined) videoTransformStyle.filter = `blur(${kfProps.blur}px)`;
  }

  return (
    <div ref={containerRef} className="h-full flex bg-background">
      {/* Main preview area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pure video area — NOTHING but the video, overlays, and captions */}
        <div
          ref={videoAreaRef}
          className="flex-1 flex items-center justify-center bg-muted/30 dark:bg-black relative overflow-hidden"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {src ? (
            <>
              <video
                ref={videoRef}
                src={src}
                className="max-w-full max-h-full object-contain"
                style={videoTransformStyle}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setPlaying(false)}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={() => setPlaying(!isPlaying)}
                muted={muted}
              />
              {/* Live text overlays from filters */}
              {selectedClipId && hasTextOverlays && (
                <TextOverlays clipId={selectedClipId} />
              )}
              {/* Caption overlay on video */}
              {hasCaptions && (
                <CaptionOverlay
                  captionStyle={captionStyle}
                  onStyleChange={setCaptionStyle}
                  onCaptionClick={() => setShowCaptionProps(true)}
                  containerRef={videoAreaRef}
                />
              )}
            </>
          ) : (
            <label
              className={`flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-full transition-colors rounded-lg border-2 border-dashed ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
                }`}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Upload className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop video here or click to import</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, AVI, MKV, MP3, WAV</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                <Film className="w-4 h-4" /> Choose File
              </Button>
              <input
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                className="hidden"
                onChange={(e) => { handleImportFiles(e.target.files); e.currentTarget.value = ''; }}
              />
            </label>
          )}

          {dragOver && src && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-30">
              <p className="text-sm font-medium text-primary">Drop to import</p>
            </div>
          )}
        </div>

        {/* Everything below is OUTSIDE the video area */}
        {src && (
          <div className="bg-card border-t border-border flex-shrink-0">
            {/* Info bar: timecode left, resolution right */}
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatTimecode(playhead)} {videoMeta ? `· F${Math.floor(playhead * 30)}` : ''}
              </span>
              {videoMeta && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {aspectRatio} · {videoMeta.h}p
                </span>
              )}
            </div>

            {/* Scrubber bar */}
            {totalDuration > 0 && (
              <div className="px-3 pb-1">
                <Slider value={[playhead]} onValueChange={handleScrub} onValueCommit={handleScrubEnd} max={totalDuration} step={0.01} className="h-2" />
              </div>
            )}

            {/* Transport controls */}
            <div className="px-3 py-1.5 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPlayhead(0); if (videoRef.current) videoRef.current.currentTime = 0; }}>
                <SkipBack className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { const v = videoRef.current; if (v) { v.currentTime = v.duration; setPlayhead(v.duration); } }}>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>

              <span className="font-mono text-[10px] text-muted-foreground min-w-[80px]">
                {formatTimecode(playhead)} <span className="opacity-50">/ {formatTimecode(totalDuration)}</span>
              </span>

              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="h-6 text-[10px] bg-transparent border border-border rounded px-1 text-muted-foreground cursor-pointer"
              >
                {PLAYBACK_RATES.map((r) => (
                  <option key={r} value={r}>{r}×</option>
                ))}
              </select>

              <div className="flex-1" />

              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </Button>
              <div className="w-16">
                <Slider value={[muted ? 0 : volume * 100]} onValueChange={([v]) => { setVolume(v / 100); setMuted(false); }} max={100} step={1} />
              </div>

              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Caption properties panel */}
      {showCaptionProps && hasCaptions && (
        <div className="w-[260px] border-l border-border flex-shrink-0 overflow-hidden">
          <CaptionPropertiesPanel
            style={captionStyle}
            onChange={setCaptionStyle}
            onClose={() => setShowCaptionProps(false)}
          />
        </div>
      )}
    </div>
  );
}
