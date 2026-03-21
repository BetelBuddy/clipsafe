import { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAiStore } from '@/stores/aiStore';
import {
  Undo2, Redo2, Download, Magnet, Sparkles, Play, Pause, SkipBack, SkipForward,
  ZoomIn, ZoomOut, PanelLeft, PanelRight, Scissors, Upload, Mic, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExportModal } from './ExportModal';
import { buildMediaFile } from '@/lib/mediaImport';

export function ToolBar() {
  const {
    undo, redo, historyIndex, history, snapEnabled, toggleSnap,
    isPlaying, setPlaying, playhead, setPlayhead, zoom, setZoom,
    projectName, setProjectName, splitClipAtPlayhead, selection,
    importAndAddToTimeline,
  } = useEditorStore();
  const { toggleShowMediaBin, showMediaBin, toggleShowProperties, showProperties, toggleShowCaptions, showCaptions, toggleTheaterMode, theaterMode } = useLayoutStore();
  const { togglePanel, isPanelOpen } = useAiStore();
  const [editingName, setEditingName] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const media = await buildMediaFile(file);
      importAndAddToTimeline(media);
    }
  }, [importAndAddToTimeline]);

  return (
    <>
      <div className="h-10 border-b border-border flex items-center px-2 gap-1 bg-card flex-shrink-0">
        {/* Left: project name + undo/redo */}
        {editingName ? (
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="h-6 w-36 text-xs"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1.5 px-1 truncate max-w-[180px]">
            <button
              className="text-xs font-semibold text-foreground/90 hover:text-foreground transition-colors truncate"
              onClick={() => setEditingName(true)}
            >
              {projectName}
            </button>
            <Badge variant="outline" className="h-4 px-1 text-[8px] font-mono border-primary/20 text-primary/80">BETA</Badge>
          </div>
        )}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Import button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => importRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> Import
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import media (I)</TooltipContent>
        </Tooltip>
        <input id="editor-file-import" ref={importRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={(e) => { handleImport(e.target.files); e.currentTarget.value = ''; }} />

        <div className="w-px h-5 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIndex < 0}>
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={snapEnabled ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleSnap}>
              <Magnet className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Snap to edges</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={splitClipAtPlayhead} disabled={selection.length !== 1}>
              <Scissors className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split at playhead (S)</TooltipContent>
        </Tooltip>

        {/* Center: playback controls */}
        <div className="flex-1 flex items-center justify-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPlayhead(Math.max(0, playhead - 5))}>
            <SkipBack className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPlayhead(playhead + 5)}>
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>

        {/* Right: zoom, view toggles, export */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom * 0.75)}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <div className="w-16">
            <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={10} max={500} step={5} />
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom * 1.33)}>
            <ZoomIn className="w-3 h-3" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={theaterMode ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleTheaterMode}>
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Theater Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showMediaBin ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleShowMediaBin}>
                <PanelLeft className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Media Bin</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showProperties ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleShowProperties}>
                <PanelRight className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Properties</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showCaptions ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleShowCaptions}>
                <Mic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Captions</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={isPanelOpen ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={togglePanel}>
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Assistant</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowExport(true)}>
                <Download className="w-3 h-3" /> Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export project</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
