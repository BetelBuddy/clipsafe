import { useEditorStore, type FilterConfig } from '@/stores/editorStore';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const AVAILABLE_FILTERS = [
  { type: 'blur', label: 'Blur', defaults: { intensity: 5 } },
  { type: 'sharpen', label: 'Sharpen', defaults: { intensity: 3 } },
  { type: 'brightness', label: 'Brightness', defaults: { value: 0 } },
  { type: 'contrast', label: 'Contrast', defaults: { value: 1 } },
  { type: 'saturation', label: 'Saturation', defaults: { value: 1 } },
  { type: 'vignette', label: 'Vignette', defaults: { intensity: 0.5 } },
  { type: 'denoise', label: 'Denoise', defaults: { strength: 5 } },
  { type: 'fade-in', label: 'Fade In', defaults: { duration: 1 } },
  { type: 'fade-out', label: 'Fade Out', defaults: { duration: 1 } },
  { type: 'vintage', label: 'Vintage', defaults: {} },
  { type: 'edge-detect', label: 'Edge Detect', defaults: {} },
  { type: 'pixelate', label: 'Pixelate', defaults: { size: 10 } },
];

export function PropertiesPanel() {
  const { selection, clips, updateClip, addFilterToClip, removeFilterFromClip, setClipOpacity, setClipVolume, setClipSpeed } = useEditorStore();
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  const selectedClip = selection.length === 1 ? clips[selection[0]] : null;

  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
          {selection.length === 0 ? 'Select a clip to edit' : `${selection.length} clips selected`}
        </div>
      </div>
    );
  }

  const clipId = selectedClip.id;

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-4 text-xs">
        {/* Clip name */}
        <div>
          <label className="text-muted-foreground block mb-1">Label</label>
          <Input
            value={selectedClip.label}
            onChange={(e) => updateClip(clipId, { label: e.target.value })}
            className="h-7 text-xs"
          />
        </div>

        {/* Time controls */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-muted-foreground block mb-1">Start (s)</label>
            <Input
              type="number"
              step="0.1"
              value={selectedClip.startOnTimeline.toFixed(2)}
              onChange={(e) => updateClip(clipId, { startOnTimeline: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Duration (s)</label>
            <Input
              type="number"
              step="0.1"
              value={selectedClip.duration.toFixed(2)}
              onChange={(e) => updateClip(clipId, { duration: parseFloat(e.target.value) || 0.1 })}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Trim In</label>
            <Input
              type="number"
              step="0.1"
              value={selectedClip.trimStart.toFixed(2)}
              onChange={(e) => updateClip(clipId, { trimStart: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Trim Out</label>
            <Input
              type="number"
              step="0.1"
              value={selectedClip.trimEnd.toFixed(2)}
              onChange={(e) => updateClip(clipId, { trimEnd: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="text-muted-foreground block mb-1">Opacity: {Math.round((selectedClip.opacity ?? 1) * 100)}%</label>
          <Slider
            value={[(selectedClip.opacity ?? 1) * 100]}
            onValueChange={([v]) => setClipOpacity(clipId, v / 100)}
            max={100} min={0} step={1}
          />
        </div>

        {/* Volume */}
        <div>
          <label className="text-muted-foreground block mb-1">Volume: {Math.round((selectedClip.volume ?? 1) * 100)}%</label>
          <Slider
            value={[(selectedClip.volume ?? 1) * 100]}
            onValueChange={([v]) => setClipVolume(clipId, v / 100)}
            max={200} min={0} step={1}
          />
        </div>

        {/* Speed */}
        <div>
          <label className="text-muted-foreground block mb-1">Speed: {(selectedClip.speed ?? 1).toFixed(2)}×</label>
          <Slider
            value={[(selectedClip.speed ?? 1) * 100]}
            onValueChange={([v]) => setClipSpeed(clipId, v / 100)}
            max={400} min={25} step={5}
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="text-muted-foreground block mb-1">Clip Color</label>
          <div className="flex gap-1.5">
            {['hsl(0 100% 62%)', 'hsl(210 100% 56%)', 'hsl(142 72% 46%)', 'hsl(48 96% 53%)', 'hsl(280 87% 65%)', 'hsl(180 60% 45%)'].map((c) => (
              <button
                key={c}
                className={cn('w-5 h-5 rounded-full border-2 transition-transform', selectedClip.color === c ? 'border-foreground scale-125' : 'border-transparent')}
                style={{ backgroundColor: c }}
                onClick={() => updateClip(clipId, { color: c })}
              />
            ))}
          </div>
        </div>

        {/* Filter stack */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-muted-foreground">Filters ({selectedClip.filters.length})</label>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowFilterPicker(!showFilterPicker)}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {showFilterPicker && (
            <div className="border border-border rounded-md p-1.5 mb-2 bg-surface max-h-32 overflow-y-auto">
              {AVAILABLE_FILTERS.map((f) => (
                <button
                  key={f.type}
                  className="w-full text-left px-2 py-1 text-[10px] hover:bg-surface-elevated rounded transition-colors"
                  onClick={() => {
                    addFilterToClip(clipId, { id: crypto.randomUUID(), type: f.type, params: { ...f.defaults } });
                    setShowFilterPicker(false);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {selectedClip.filters.length === 0 ? (
            <div className="text-muted-foreground text-[10px] text-center py-2">No filters applied</div>
          ) : (
            <div className="space-y-1">
              {selectedClip.filters.map((f, i) => (
                <div key={f.id} className="flex items-center gap-1 bg-surface-elevated rounded px-2 py-1">
                  <GripVertical className="w-3 h-3 text-muted-foreground/40 cursor-grab flex-shrink-0" />
                  <span className="flex-1 text-[10px] font-medium">{f.type}</span>
                  <button onClick={() => removeFilterFromClip(clipId, f.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
