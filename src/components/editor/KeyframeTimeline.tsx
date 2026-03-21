import { useMemo } from 'react';
import { useKeyframeStore, ANIMATABLE_PROPERTIES, type Keyframe } from '@/stores/keyframeStore';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Diamond, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/** Keyframe property editor for the properties panel */
export function KeyframePropertyEditor({ clipId }: { clipId: string }) {
  const { keyframes, addKeyframe, removeKeyframe, updateKeyframe, selectKeyframe, selectedKeyframeId } = useKeyframeStore();
  const { playhead } = useEditorStore();
  const [selectedProp, setSelectedProp] = useState<string>('opacity');

  const clipKeyframes = useMemo(() => 
    keyframes.filter(k => k.clipId === clipId),
    [keyframes, clipId]
  );

  const propKeyframes = useMemo(() => 
    clipKeyframes.filter(k => k.property === selectedProp).sort((a, b) => a.time - b.time),
    [clipKeyframes, selectedProp]
  );

  const propDef = ANIMATABLE_PROPERTIES.find(p => p.id === selectedProp);

  const handleAddKeyframe = () => {
    if (!propDef) return;
    // Check if keyframe already exists at this time
    const existing = propKeyframes.find(k => Math.abs(k.time - playhead) < 0.05);
    if (existing) return;

    addKeyframe({
      clipId,
      property: selectedProp,
      time: playhead,
      value: propDef.defaultValue,
      easing: 'ease-in-out',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <Diamond className="w-3 h-3 text-primary" />
          Keyframes
        </h3>
        <span className="text-[10px] text-muted-foreground">{clipKeyframes.length} total</span>
      </div>

      <div className="flex gap-2">
        <Select value={selectedProp} onValueChange={setSelectedProp}>
          <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ANIMATABLE_PROPERTIES.map(p => (
              <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleAddKeyframe}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* List of keyframes for selected property */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {propKeyframes.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            No keyframes. Click + to add at playhead.
          </p>
        ) : (
          propKeyframes.map(kf => (
            <KeyframeRow
              key={kf.id}
              kf={kf}
              propDef={propDef!}
              isSelected={kf.id === selectedKeyframeId}
              onSelect={() => selectKeyframe(kf.id)}
              onUpdate={(updates) => updateKeyframe(kf.id, updates)}
              onDelete={() => removeKeyframe(kf.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KeyframeRow({
  kf, propDef, isSelected, onSelect, onUpdate, onDelete,
}: {
  kf: Keyframe;
  propDef: (typeof ANIMATABLE_PROPERTIES)[number];
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (u: Partial<Keyframe>) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded text-[10px] cursor-pointer transition-colors',
        isSelected ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50 border border-transparent',
      )}
      onClick={onSelect}
    >
      <Diamond className="w-2.5 h-2.5 text-primary flex-shrink-0" />
      <span className="font-mono text-muted-foreground w-12">{kf.time.toFixed(2)}s</span>
      <div className="flex-1">
        <Slider
          value={[kf.value]}
          onValueChange={([v]) => onUpdate({ value: v })}
          min={propDef.min}
          max={propDef.max}
          step={'step' in propDef ? propDef.step : 1}
          className="h-1"
        />
      </div>
      <span className="font-mono w-10 text-right">{kf.value.toFixed(2)}</span>
      <select
        value={kf.easing}
        onChange={(e) => onUpdate({ easing: e.target.value as any })}
        className="h-5 text-[9px] bg-transparent border border-border rounded px-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="linear">Lin</option>
        <option value="ease-in">In</option>
        <option value="ease-out">Out</option>
        <option value="ease-in-out">InOut</option>
      </select>
      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <Trash2 className="w-2.5 h-2.5" />
      </Button>
    </div>
  );
}

/** Diamond markers rendered on timeline clips */
export function ClipKeyframeDiamonds({ clipId, zoom }: { clipId: string; zoom: number }) {
  const { keyframes, selectKeyframe, selectedKeyframeId } = useKeyframeStore();
  
  const clipKfs = useMemo(() => 
    keyframes.filter(k => k.clipId === clipId),
    [keyframes, clipId]
  );

  if (clipKfs.length === 0) return null;

  return (
    <>
      {clipKfs.map(kf => (
        <div
          key={kf.id}
          className={cn(
            'absolute top-0 bottom-0 flex items-center z-10 cursor-pointer',
          )}
          style={{ left: kf.time * zoom }}
          onClick={(e) => { e.stopPropagation(); selectKeyframe(kf.id); }}
          title={`${kf.property}: ${kf.value.toFixed(2)} @ ${kf.time.toFixed(2)}s`}
        >
          <Diamond
            className={cn(
              'w-2.5 h-2.5 -translate-x-1/2',
              kf.id === selectedKeyframeId ? 'text-primary fill-primary' : 'text-yellow-400 fill-yellow-400/50',
            )}
          />
        </div>
      ))}
    </>
  );
}
