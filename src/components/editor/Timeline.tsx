import { useRef, useCallback, useMemo, useState, memo, type MouseEvent } from 'react';
import { useEditorStore, type Track, type Clip, getNextClipColor } from '@/stores/editorStore';
import { useCaptionsStore, type CaptionSegment } from '@/stores/captionsStore';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Lock, Unlock, Plus, ZoomIn, ZoomOut, Trash2, Scissors, Copy, GripVertical, Film, Captions, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildMediaFile } from '@/lib/mediaImport';

function TimeRuler({ zoom, duration }: { zoom: number; duration: number }) {
  const marks: number[] = [];
  const step = zoom < 30 ? 10 : zoom < 80 ? 5 : zoom < 200 ? 1 : 0.5;
  for (let t = 0; t <= duration; t += step) marks.push(t);

  return (
    <div className="h-6 border-b border-border relative bg-surface flex-shrink-0" style={{ width: duration * zoom }}>
      {marks.map((t) => (
        <div key={t} className="absolute top-0 h-full flex flex-col items-center" style={{ left: t * zoom }}>
          <div className="w-px h-2 bg-border" />
          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
            {t >= 60 ? `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}` : `${t}s`}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───── Context menu ───── */
function ClipContextMenu({ x, y, clipId, onClose }: { x: number; y: number; clipId: string; onClose: () => void }) {
  const { splitClipAtPlayhead, duplicateSelected, deleteSelected, selectClip } = useEditorStore();
  const actions = [
    { label: 'Split at playhead', icon: <Scissors className="w-3 h-3" />, key: 'S', action: () => { selectClip(clipId); splitClipAtPlayhead(); } },
    { label: 'Duplicate', icon: <Copy className="w-3 h-3" />, key: 'Ctrl+D', action: () => { selectClip(clipId); duplicateSelected(); } },
    { label: 'Delete', icon: <Trash2 className="w-3 h-3" />, key: 'Del', action: () => { selectClip(clipId); deleteSelected(); }, destructive: true },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[160px]" style={{ left: x, top: y }}>
        {actions.map((a) => (
          <button
            key={a.label}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors',
              a.destructive && 'text-destructive hover:text-destructive',
            )}
            onClick={() => { a.action(); onClose(); }}
          >
            {a.icon}
            <span className="flex-1 text-left">{a.label}</span>
            <span className="text-muted-foreground text-[10px]">{a.key}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ───── Timeline Clip (with trim handles) - MEMOIZED ───── */
const TimelineClip = memo(function TimelineClip({
  clip, zoom, isSelected, onClick, onContextMenu, onDragStart,
}: {
  clip: Clip; zoom: number; isSelected: boolean;
  onClick: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  onDragStart: (e: MouseEvent, edge?: 'left' | 'right') => void;
}) {
  const width = Math.max(clip.duration * zoom, 8);
  const showHandles = width > 24;

  return (
    <div
      className={cn(
        'absolute top-1 bottom-1 rounded-sm cursor-grab transition-shadow text-[10px] font-medium overflow-hidden select-none group',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50'
      )}
      style={{
        left: clip.startOnTimeline * zoom,
        width,
        backgroundColor: clip.color,
        opacity: clip.opacity ?? 1,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={(e) => { if (e.button === 0) onDragStart(e); }}
    >
      {showHandles && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-foreground/0 hover:bg-foreground/20 transition-colors z-10"
          onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, 'left'); }}
        />
      )}
      <div className="px-2 py-0.5 truncate text-foreground/90 mix-blend-difference pointer-events-none">
        {clip.label}
        {clip.filters.length > 0 && <span className="ml-1 opacity-60">({clip.filters.length}fx)</span>}
      </div>
      {showHandles && (
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-foreground/0 hover:bg-foreground/20 transition-colors z-10"
          onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, 'right'); }}
        />
      )}
    </div>
  );
}, (prev, next) => {
  // Custom equality check for better performance
  return (
    prev.clip.id === next.clip.id &&
    prev.clip.startOnTimeline === next.clip.startOnTimeline &&
    prev.clip.duration === next.clip.duration &&
    prev.clip.label === next.clip.label &&
    prev.clip.color === next.clip.color &&
    prev.clip.opacity === next.clip.opacity &&
    prev.clip.filters.length === next.clip.filters.length &&
    prev.zoom === next.zoom &&
    prev.isSelected === next.isSelected
  );
});

/* ───── Track row - MEMOIZED ───── */
const TrackRow = memo(function TrackRow({ track, clips, zoom, trackIndex, totalTracks, allTracks }: { track: Track; clips: Clip[]; zoom: number; trackIndex: number; totalTracks: number; allTracks: Track[] }) {
  const { toggleTrackMute, toggleTrackLock, removeTrack, selectClip, selection, moveClip, updateClip, snapEnabled, playhead } = useEditorStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clipId: string } | null>(null);
  const [dropHighlight, setDropHighlight] = useState(false);

  const handleDragStart = useCallback((e: MouseEvent, clip: Clip, edge?: 'left' | 'right') => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originalStart = clip.startOnTimeline;
    const originalDuration = clip.duration;
    const originalTrimStart = clip.trimStart;
    const originalTrackId = clip.trackId;
    let currentTrackId = originalTrackId;

    const onMove = (me: globalThis.MouseEvent) => {
      const dx = (me.clientX - startX) / zoom;
      const dy = me.clientY - startY;

      if (edge === 'left') {
        const newStart = Math.max(0, originalStart + dx);
        const trimDelta = newStart - originalStart;
        updateClip(clip.id, {
          startOnTimeline: newStart,
          trimStart: originalTrimStart + trimDelta,
          duration: originalDuration - trimDelta,
        });
      } else if (edge === 'right') {
        updateClip(clip.id, { duration: Math.max(0.1, originalDuration + dx) });
      } else {
        let newStart = Math.max(0, originalStart + dx);
        if (snapEnabled) {
          const snapThreshold = 5 / zoom;
          const edges = [playhead, 0];
          Object.values(useEditorStore.getState().clips).forEach((c) => {
            if (c.id === clip.id) return;
            edges.push(c.startOnTimeline, c.startOnTimeline + c.duration);
          });
          for (const snapEdge of edges) {
            if (Math.abs(newStart - snapEdge) < snapThreshold) { newStart = snapEdge; break; }
            if (Math.abs(newStart + clip.duration - snapEdge) < snapThreshold) { newStart = snapEdge - clip.duration; break; }
          }
        }

        // Vertical track switching: detect which track row the mouse is over
        const trackHeight = track.height;
        const trackDelta = Math.round(dy / trackHeight);
        if (trackDelta !== 0) {
          const newTrackIndex = Math.max(0, Math.min(allTracks.length - 1, trackIndex + trackDelta));
          const newTrack = allTracks[newTrackIndex];
          if (newTrack && newTrack.id !== currentTrackId) {
            currentTrackId = newTrack.id;
          }
        }

        moveClip(clip.id, newStart, currentTrackId !== originalTrackId ? currentTrackId : undefined);
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoom, moveClip, updateClip, snapEnabled, playhead, track.height, trackIndex, allTracks]);

  return (
    <div
      className={cn('flex border-b border-border', dropHighlight && 'bg-primary/5')}
      style={{ height: track.height }}
    >
      <div className="w-28 flex-shrink-0 border-r border-border flex items-center gap-1 px-2 bg-surface">
        <GripVertical className="w-3 h-3 text-muted-foreground/40 cursor-grab" />
        <span className="text-[10px] font-semibold text-muted-foreground w-6">{track.label}</span>
        <button onClick={() => toggleTrackMute(track.id)} className="text-muted-foreground hover:text-foreground">
          {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>
        <button onClick={() => toggleTrackLock(track.id)} className="text-muted-foreground hover:text-foreground">
          {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-40" />}
        </button>
        <button onClick={() => removeTrack(track.id)} className="text-muted-foreground hover:text-destructive ml-auto">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 relative bg-muted/10 dark:bg-surface-elevated/30">
        {clips.map((clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            zoom={zoom}
            isSelected={selection.includes(clip.id)}
            onClick={(e) => selectClip(clip.id, e.shiftKey)}
            onContextMenu={(e) => { e.preventDefault(); selectClip(clip.id); setContextMenu({ x: e.clientX, y: e.clientY, clipId: clip.id }); }}
            onDragStart={(e, edge) => handleDragStart(e, clip, edge)}
          />
        ))}
        {contextMenu && (
          <ClipContextMenu x={contextMenu.x} y={contextMenu.y} clipId={contextMenu.clipId} onClose={() => setContextMenu(null)} />
        )}
      </div>
    </div>
  );
});

/* ───── Caption Track Row ───── */
function CaptionTrackRow({ zoom, duration }: { zoom: number; duration: number }) {
  const { segments } = useCaptionsStore();
  const { playhead } = useEditorStore();

  // Group words into display blocks
  const captionBlocks = useMemo(() => {
    const allWords = segments.flatMap(s =>
      s.words.filter(w => !w.deleted && w.type !== 'silence')
    );
    const blocks: { text: string; start: number; end: number }[] = [];
    let current: typeof allWords = [];

    for (const w of allWords) {
      if (current.length > 0) {
        const gap = w.start - current[current.length - 1].end;
        if (gap > 0.5 || current.length >= 10) {
          blocks.push({
            text: current.map(cw => cw.text).join(' '),
            start: current[0].start,
            end: current[current.length - 1].end,
          });
          current = [];
        }
      }
      current.push(w);
    }
    if (current.length > 0) {
      blocks.push({
        text: current.map(cw => cw.text).join(' '),
        start: current[0].start,
        end: current[current.length - 1].end,
      });
    }
    return blocks;
  }, [segments]);

  if (segments.length === 0) return null;

  return (
    <div className="flex border-b border-border" style={{ height: 36 }}>
      <div className="w-28 flex-shrink-0 border-r border-border flex items-center gap-1 px-2 bg-surface">
        <Captions className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground">CC</span>
      </div>
      <div className="flex-1 relative bg-surface-elevated/30">
        {captionBlocks.map((block, i) => {
          const left = block.start * zoom;
          const width = Math.max((block.end - block.start) * zoom, 4);
          const isActive = playhead >= block.start && playhead <= block.end;
          return (
            <div
              key={i}
              className={cn(
                'absolute top-1 bottom-1 rounded-sm text-[9px] font-medium overflow-hidden select-none px-1.5 flex items-center',
                isActive
                  ? 'bg-primary/30 ring-1 ring-primary text-primary-foreground'
                  : 'bg-accent/60 text-accent-foreground hover:bg-accent/80'
              )}
              style={{ left, width }}
              title={block.text}
            >
              <span className="truncate">{block.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Beat Markers Display ───── */
function BeatMarkers({ zoom }: { zoom: number }) {
  const beatMarkers = useEditorStore((s) => s.beatMarkers);
  const bpm = useEditorStore((s) => s.bpm);

  if (beatMarkers.length === 0) return null;

  return (
    <>
      {/* BPM indicator */}
      <div className="absolute top-7 left-2 z-30 flex items-center gap-1 bg-accent/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-accent-foreground">
        <Music className="w-3 h-3" />
        {bpm} BPM
      </div>
      {/* Beat lines */}
      {beatMarkers.map((beat, i) => (
        <div
          key={i}
          className="absolute top-6 bottom-0 w-px pointer-events-none z-10"
          style={{
            left: 112 + beat.time * zoom,
            backgroundColor: `hsl(var(--primary) / ${0.3 + beat.strength * 0.5})`,
          }}
        />
      ))}
    </>
  );
}

/* ───── Main Timeline ───── */
export function Timeline() {
  const { tracks, clips, playhead, setPlayhead, zoom, setZoom, duration, addTrack, addClip, mediaFiles, clearSelection, splitClipAtPlayhead, duplicateSelected, deleteSelected, importAndAddToTimeline } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasClips = Object.keys(clips).length > 0;

  const clipsByTrack = useMemo(() => {
    const map: Record<string, Clip[]> = {};
    tracks.forEach((t) => { map[t.id] = []; });
    Object.values(clips).forEach((c) => {
      if (map[c.trackId]) map[c.trackId].push(c);
    });
    return map;
  }, [tracks, clips]);

  const handleRulerClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
    setPlayhead(x / zoom);
  }, [zoom, setPlayhead]);

  const handlePlayheadDrag = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const onMove = (me: globalThis.MouseEvent) => {
      const rect = scrollEl.getBoundingClientRect();
      const x = me.clientX - rect.left + scrollEl.scrollLeft - 112;
      setPlayhead(Math.max(0, x / zoom));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoom, setPlayhead]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();

    const mediaId = e.dataTransfer.getData('media-id');
    if (mediaId) {
      const media = mediaFiles.find((f) => f.id === mediaId);
      if (!media) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
      const startTime = Math.max(0, x / zoom);
      const trackType = media.type === 'audio' ? 'audio' : 'video';
      let track = tracks.find((t) => t.type === trackType);
      if (!track) {
        addTrack(trackType);
        track = useEditorStore.getState().tracks.find((t) => t.type === trackType)!;
      }
      addClip({
        id: crypto.randomUUID(),
        trackId: track.id,
        sourceFileId: media.id,
        sourceFileName: media.name,
        startOnTimeline: startTime,
        trimStart: 0,
        trimEnd: media.duration,
        duration: media.duration,
        filters: [],
        color: getNextClipColor(),
        label: media.name.split('.')[0],
        opacity: 1,
        volume: 1,
        speed: 1,
      });
      return;
    }

    if (e.dataTransfer.files.length > 0) {
      for (const file of Array.from(e.dataTransfer.files)) {
        const media = await buildMediaFile(file);
        importAndAddToTimeline(media);
      }
    }
  }, [mediaFiles, zoom, tracks, addTrack, addClip, importAndAddToTimeline]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.15 : 0.87));
    }
  }, [zoom, setZoom]);

  return (
    <div className="h-full flex flex-col bg-card" onClick={(e) => { if (e.target === e.currentTarget) clearSelection(); }}>
      {/* Timeline header */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addTrack('video')}>
          <Plus className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-muted-foreground">Add Track</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={splitClipAtPlayhead}>
          <Scissors className="w-3 h-3" /> Split
        </Button>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={duplicateSelected}>
          <Copy className="w-3 h-3" /> Dup
        </Button>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-destructive" onClick={deleteSelected}>
          <Trash2 className="w-3 h-3" /> Del
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom * 0.75)}>
          <ZoomOut className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-muted-foreground font-mono w-8 text-center">{Math.round(zoom)}%</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom * 1.33)}>
          <ZoomIn className="w-3 h-3" />
        </Button>
      </div>

      {/* Timeline body */}
      <div
        className="flex-1 overflow-auto relative"
        ref={scrollRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onWheel={handleWheel}
      >
        {!hasClips && mediaFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Film className="w-12 h-12 opacity-20" />
            <p className="text-sm">Import media to start editing</p>
            <p className="text-xs opacity-60">Drop files here, or press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">I</kbd> to import</p>
          </div>
        ) : (
          <div style={{ width: Math.max(duration * zoom, 800), minHeight: '100%' }}>
            {/* Ruler */}
            <div onClick={handleRulerClick} className="cursor-crosshair sticky top-0 z-10">
              <TimeRuler zoom={zoom} duration={duration} />
            </div>

            {/* Tracks */}
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                clips={clipsByTrack[track.id] || []}
                zoom={zoom}
                trackIndex={idx}
                totalTracks={tracks.length}
                allTracks={tracks}
              />
            ))}

            {/* Caption Track */}
            <CaptionTrackRow zoom={zoom} duration={duration} />

            {/* Beat Markers */}
            <BeatMarkers zoom={zoom} />

            {/* Playhead - using id for direct DOM updates from playhead engine */}
            <div
              id="playhead-cursor"
              className="absolute top-0 bottom-0 w-px bg-primary z-20 pointer-events-auto cursor-col-resize"
              style={{ left: 112, transform: `translateX(${playhead * zoom}px)` }}
              onMouseDown={handlePlayheadDrag}
            >
              <div className="w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
