import { useState, useRef, useEffect, useCallback } from 'react';
import { useCaptionsStore, generateSRT, CaptionWord } from '@/stores/captionsStore';
import { useEditorStore } from '@/stores/editorStore';
import { transcribeMedia } from '@/lib/transcribe';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Mic, Trash2, RotateCcw, Sparkles, Download, Scissors,
  AlertCircle, Loader2, Wand2, Volume2, VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CaptionsPanel() {
  const {
    segments, loading, error, sourceClipId,
    setSegments, setLoading, setError, deleteWords, restoreWords,
    removeAllFillers, removeAllSilences, restoreAll, autoClean, clear,
  } = useCaptionsStore();
  const { clips, mediaFiles, playhead, setPlayhead, selection } = useEditorStore();
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const wordsRef = useRef<HTMLDivElement>(null);

  const selectedClip = selection.length === 1 ? clips[selection[0]] : null;
  const hasSegments = segments.length > 0;
  const totalWords = segments.reduce((sum, s) => sum + s.words.length, 0);
  const deletedWords = segments.reduce((sum, s) => sum + s.words.filter((w) => w.deleted).length, 0);
  const fillerCount = segments.reduce((sum, s) => sum + s.words.filter((w) => w.type === 'filler').length, 0);
  const silenceCount = segments.reduce((sum, s) => sum + s.words.filter((w) => w.type === 'silence').length, 0);

  const handleTranscribe = useCallback(async () => {
    const clip = selectedClip || (Object.values(clips).length > 0 ? Object.values(clips)[0] : null);
    if (!clip) {
      toast.error('No clip to transcribe. Import a video first.');
      return;
    }

    const media = mediaFiles.find((m) => m.id === clip.sourceFileId);
    if (!media) {
      toast.error('Media file not found.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await transcribeMedia(media.url, media.name);
      if (result.length === 0 || result.every((s) => s.words.length === 0)) {
        setError('No speech detected in this media. The file may not contain any spoken audio.');
        setLoading(false);
        return;
      }
      setSegments(result, clip.id);
      setLoading(false);
      toast.success(`Transcribed ${result.reduce((s, seg) => s + seg.words.length, 0)} words`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transcription failed';
      setError(msg);
      setLoading(false);
      toast.error(msg);
    }
  }, [selectedClip, clips, mediaFiles, setSegments, setLoading, setError]);

  const handleWordClick = useCallback((word: CaptionWord, e: React.MouseEvent) => {
    if (e.shiftKey) {
      setSelectedWords((prev) => {
        const next = new Set(prev);
        if (next.has(word.id)) next.delete(word.id);
        else next.add(word.id);
        return next;
      });
    } else {
      setPlayhead(word.start);
      setSelectedWords(new Set());
    }
  }, [setPlayhead]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedWords.size > 0) {
      deleteWords(Array.from(selectedWords));
      setSelectedWords(new Set());
      toast.success(`Deleted ${selectedWords.size} words`);
    }
  }, [selectedWords, deleteWords]);

  const handleRestoreSelected = useCallback(() => {
    if (selectedWords.size > 0) {
      restoreWords(Array.from(selectedWords));
      setSelectedWords(new Set());
    }
  }, [selectedWords, restoreWords]);

  const handleExportSRT = useCallback(() => {
    const srt = generateSRT(segments);
    if (!srt) {
      toast.error('No active words to export');
      return;
    }
    const blob = new Blob([srt], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SRT exported');
  }, [segments]);

  const handleApplyToTimeline = useCallback(() => {
    if (!sourceClipId) return;
    const store = useEditorStore.getState();
    const clip = store.clips[sourceClipId];
    if (!clip) {
      toast.error('Source clip no longer exists');
      return;
    }

    // Find contiguous deleted regions
    const allWords = segments.flatMap((s) => s.words);
    const deletedRegions: { start: number; end: number }[] = [];
    let regionStart: number | null = null;

    for (const w of allWords) {
      if (w.deleted) {
        if (regionStart === null) regionStart = w.start;
      } else {
        if (regionStart !== null) {
          deletedRegions.push({ start: regionStart, end: allWords[allWords.indexOf(w) - 1]?.end || regionStart });
          regionStart = null;
        }
      }
    }
    if (regionStart !== null) {
      deletedRegions.push({ start: regionStart, end: allWords[allWords.length - 1].end });
    }

    if (deletedRegions.length === 0) {
      toast.info('No deleted words to cut');
      return;
    }

    // Split and remove: work backwards to preserve offsets
    store.pushHistory('Apply caption cuts');
    const currentClipId = sourceClipId;
    const sortedRegions = [...deletedRegions].sort((a, b) => b.start - a.start);

    for (const region of sortedRegions) {
      const current = store.clips[currentClipId];
      if (!current) continue;

      const clipStart = current.startOnTimeline;
      const relStart = region.start - current.trimStart + clipStart;
      const relEnd = region.end - current.trimStart + clipStart;

      // Only cut if region is within this clip
      if (relStart > clipStart && relEnd < clipStart + current.duration) {
        // Split at start of region
        store.selectClip(currentClipId);
        store.setPlayhead(relStart);
        store.splitClipAtPlayhead();

        // Find the new right clip and split at end
        const newClips = Object.values(store.clips);
        const rightClip = newClips.find((c) =>
          c.trackId === current.trackId && c.startOnTimeline === relStart
        );
        if (rightClip) {
          store.selectClip(rightClip.id);
          store.setPlayhead(relEnd);
          store.splitClipAtPlayhead();
          // Remove the middle segment
          store.removeClip(rightClip.id);
        }
      }
    }

    toast.success(`Applied ${deletedRegions.length} cuts to timeline`);
  }, [sourceClipId, segments]);

  // Empty state
  if (!hasSegments && !loading && !error) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="h-8 border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
          <Mic className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">Captions</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Text-Based Editing</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Transcribe your video to edit by text. Click words to seek, delete words to cut video, auto-remove fillers and silences.
            </p>
          </div>
          <Button
            onClick={handleTranscribe}
            disabled={Object.keys(clips).length === 0}
            className="gap-2"
            size="sm"
          >
            <Sparkles className="w-4 h-4" />
            Transcribe Video
          </Button>
          {Object.keys(clips).length === 0 && (
            <p className="text-xs text-muted-foreground">Import a video first</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="h-8 border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
        <Mic className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium">Captions</span>
        <div className="flex-1" />
        {hasSegments && (
          <span className="text-[10px] text-muted-foreground">
            {totalWords - deletedWords}/{totalWords} words
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium">Transcribing...</p>
            <p className="text-xs text-muted-foreground mt-1">Extracting audio and processing with AI</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-xs text-center text-muted-foreground max-w-[240px]">{error}</p>
          <Button variant="outline" size="sm" onClick={handleTranscribe} className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Transcript */}
      {hasSegments && !loading && (
        <>
          {/* Action bar */}
          <div className="border-b border-border px-2 py-1.5 flex flex-wrap gap-1">
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={removeAllFillers} title={`Remove ${fillerCount} fillers`}>
              <VolumeX className="w-3 h-3" /> Fillers ({fillerCount})
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={removeAllSilences} title={`Remove ${silenceCount} silences`}>
              <Volume2 className="w-3 h-3" /> Silences ({silenceCount})
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={autoClean}>
              <Wand2 className="w-3 h-3" /> Auto-Clean
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={restoreAll}>
              <RotateCcw className="w-3 h-3" /> Restore
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={handleExportSRT}>
              <Download className="w-3 h-3" /> SRT
            </Button>
            <Button variant="default" size="sm" className="h-6 text-[10px] gap-1" onClick={handleApplyToTimeline} disabled={deletedWords === 0}>
              <Scissors className="w-3 h-3" /> Apply Cuts ({deletedWords})
            </Button>
          </div>

          {/* Selected words actions */}
          {selectedWords.size > 0 && (
            <div className="border-b border-border px-2 py-1 flex items-center gap-1 bg-accent/30">
              <span className="text-[10px] text-muted-foreground">{selectedWords.size} selected</span>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={handleDeleteSelected}>
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={handleRestoreSelected}>
                <RotateCcw className="w-3 h-3" /> Restore
              </Button>
              <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setSelectedWords(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {/* Words */}
          <ScrollArea className="flex-1" ref={wordsRef}>
            <div className="p-3 space-y-3">
              {segments.map((segment) => (
                <div key={segment.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {segment.speaker}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {segment.start.toFixed(1)}s – {segment.end.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {segment.words.map((word) => {
                      const isActive = playhead >= word.start && playhead < word.end;
                      const isSelected = selectedWords.has(word.id);

                      return (
                        <button
                          key={word.id}
                          onClick={(e) => handleWordClick(word, e)}
                          className={cn(
                            'px-1 py-0.5 rounded text-xs transition-all cursor-pointer hover:ring-1 hover:ring-primary/30',
                            word.type === 'filler' && !word.deleted && 'bg-orange-500/20 text-orange-300',
                            word.type === 'silence' && !word.deleted && 'bg-muted/50 text-muted-foreground italic text-[10px]',
                            word.type === 'punctuation' && 'text-muted-foreground',
                            word.deleted && 'line-through opacity-40 bg-destructive/10 text-destructive',
                            isActive && !word.deleted && 'bg-primary/30 text-primary-foreground ring-1 ring-primary',
                            isSelected && 'ring-2 ring-accent-foreground bg-accent/50',
                            !word.deleted && word.type === 'word' && !isActive && !isSelected && 'text-foreground',
                          )}
                          title={`${word.start.toFixed(2)}s – ${word.end.toFixed(2)}s | ${word.type} | conf: ${(word.confidence * 100).toFixed(0)}%\nShift+click to multi-select`}
                        >
                          {word.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border px-3 py-1.5 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={handleTranscribe}>
              <RotateCcw className="w-3 h-3" /> Re-transcribe
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive gap-1" onClick={clear}>
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
