import { type CaptionStyle, DEFAULT_CAPTION_STYLE } from './CaptionOverlay';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RotateCcw, Type, Palette, Move, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  style: CaptionStyle;
  onChange: (s: CaptionStyle) => void;
  onClose: () => void;
}

const FONT_OPTIONS = [
  { label: 'Sans Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
];

const POSITION_PRESETS = [
  { label: 'Top Center', x: 50, y: 10 },
  { label: 'Center', x: 50, y: 50 },
  { label: 'Bottom Center', x: 50, y: 85 },
  { label: 'Top Left', x: 15, y: 10 },
  { label: 'Top Right', x: 85, y: 10 },
  { label: 'Bottom Left', x: 15, y: 90 },
  { label: 'Bottom Right', x: 85, y: 90 },
];

const STYLE_PRESETS = [
  { label: 'YouTube', style: { fontSize: 32, color: '#ffffff', outlineWidth: 3, outlineColor: '#000000', bgOpacity: 0, fontWeight: 700, activeWordColor: '#facc15' } },
  { label: 'TikTok', style: { fontSize: 36, color: '#ffffff', outlineWidth: 4, outlineColor: '#000000', bgOpacity: 0.3, bgColor: '#000000', fontWeight: 800, activeWordColor: '#22d3ee', uppercase: true } },
  { label: 'News', style: { fontSize: 24, color: '#ffffff', outlineWidth: 0, bgOpacity: 0.85, bgColor: '#003366', fontWeight: 600, activeWordColor: '#fbbf24', y: 88 } },
  { label: 'Minimal', style: { fontSize: 22, color: '#ffffff', outlineWidth: 1, outlineColor: '#000000', bgOpacity: 0, fontWeight: 400, activeWordColor: '#ffffff' } },
  { label: 'Neon', style: { fontSize: 34, color: '#00ff88', outlineWidth: 0, bgOpacity: 0, fontWeight: 700, shadowBlur: 20, shadowColor: '#00ff88', activeWordColor: '#ff00ff' } },
  { label: 'Cinematic', style: { fontSize: 28, color: '#f5f5dc', outlineWidth: 0, bgOpacity: 0, fontWeight: 300, letterSpacing: 3, fontFamily: 'Georgia, serif', activeWordColor: '#fbbf24' } },
];

type Section = 'typography' | 'colors' | 'position' | 'effects';

export function CaptionPropertiesPanel({ style, onChange, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('typography');
  const update = (partial: Partial<CaptionStyle>) => onChange({ ...style, ...partial });

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'typography', label: 'Type', icon: <Type className="w-3 h-3" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="w-3 h-3" /> },
    { id: 'position', label: 'Position', icon: <Move className="w-3 h-3" /> },
    { id: 'effects', label: 'Effects', icon: <Sparkles className="w-3 h-3" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="h-8 border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
        <Type className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium">Caption Style</span>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onChange(DEFAULT_CAPTION_STYLE)} title="Reset">
          <RotateCcw className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Presets */}
      <div className="border-b border-border px-2 py-1.5">
        <div className="text-[10px] text-muted-foreground mb-1">Presets</div>
        <div className="flex flex-wrap gap-1">
          {STYLE_PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="h-5 text-[10px] px-2"
              onClick={() => update(p.style as Partial<CaptionStyle>)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div className="border-b border-border flex px-1">
        {sections.map((s) => (
          <button
            key={s.id}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-[10px] border-b-2 transition-colors',
              activeSection === s.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveSection(s.id)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {activeSection === 'typography' && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Font Family</label>
                <Select value={style.fontFamily} onValueChange={(v) => update({ fontFamily: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value} className="text-xs" style={{ fontFamily: f.value }}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Font Size: {style.fontSize}px</label>
                <Slider value={[style.fontSize]} onValueChange={([v]) => update({ fontSize: v })} min={12} max={120} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Font Weight: {style.fontWeight}</label>
                <Slider value={[style.fontWeight]} onValueChange={([v]) => update({ fontWeight: v })} min={100} max={900} step={100} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Letter Spacing: {style.letterSpacing}px</label>
                <Slider value={[style.letterSpacing]} onValueChange={([v]) => update({ letterSpacing: v })} min={-2} max={10} step={0.5} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Line Height: {style.lineHeight}</label>
                <Slider value={[style.lineHeight * 10]} onValueChange={([v]) => update({ lineHeight: v / 10 })} min={8} max={25} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Max Words Visible: {style.maxWords}</label>
                <Slider value={[style.maxWords]} onValueChange={([v]) => update({ maxWords: v })} min={3} max={20} step={1} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-muted-foreground">Uppercase</label>
                <Switch checked={style.uppercase} onCheckedChange={(v) => update({ uppercase: v })} />
              </div>
            </>
          )}

          {activeSection === 'colors' && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Active Word Color (spoken now)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.activeWordColor} onChange={(e) => update({ activeWordColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.activeWordColor} onChange={(e) => update({ activeWordColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Spoken Words Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.spokenWordColor} onChange={(e) => update({ spokenWordColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.spokenWordColor} onChange={(e) => update({ spokenWordColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Upcoming Words Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.upcomingWordColor} onChange={(e) => update({ upcomingWordColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.upcomingWordColor} onChange={(e) => update({ upcomingWordColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.bgColor} onChange={(e) => update({ bgColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.bgColor} onChange={(e) => update({ bgColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Background Opacity: {Math.round(style.bgOpacity * 100)}%</label>
                <Slider value={[style.bgOpacity * 100]} onValueChange={([v]) => update({ bgOpacity: v / 100 })} min={0} max={100} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Outline Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.outlineColor} onChange={(e) => update({ outlineColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.outlineColor} onChange={(e) => update({ outlineColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Outline Width: {style.outlineWidth}px</label>
                <Slider value={[style.outlineWidth]} onValueChange={([v]) => update({ outlineWidth: v })} min={0} max={8} step={0.5} />
              </div>
            </>
          )}

          {activeSection === 'position' && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Position Presets</label>
                <div className="grid grid-cols-3 gap-1">
                  {POSITION_PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() => update({ x: p.x, y: p.y })}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">X Position: {style.x.toFixed(0)}%</label>
                <Slider value={[style.x]} onValueChange={([v]) => update({ x: v })} min={5} max={95} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Y Position: {style.y.toFixed(0)}%</label>
                <Slider value={[style.y]} onValueChange={([v]) => update({ y: v })} min={5} max={95} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Padding: {style.padding}px</label>
                <Slider value={[style.padding]} onValueChange={([v]) => update({ padding: v })} min={0} max={24} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Border Radius: {style.borderRadius}px</label>
                <Slider value={[style.borderRadius]} onValueChange={([v]) => update({ borderRadius: v })} min={0} max={20} step={1} />
              </div>
            </>
          )}

          {activeSection === 'effects' && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Shadow Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={style.shadowColor} onChange={(e) => update({ shadowColor: e.target.value })} className="w-8 h-6 rounded border border-border cursor-pointer" />
                  <Input value={style.shadowColor} onChange={(e) => update({ shadowColor: e.target.value })} className="h-6 text-[10px] font-mono flex-1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Shadow Blur: {style.shadowBlur}px</label>
                <Slider value={[style.shadowBlur]} onValueChange={([v]) => update({ shadowBlur: v })} min={0} max={30} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Shadow X: {style.shadowX}px</label>
                <Slider value={[style.shadowX]} onValueChange={([v]) => update({ shadowX: v })} min={-10} max={10} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Shadow Y: {style.shadowY}px</label>
                <Slider value={[style.shadowY]} onValueChange={([v]) => update({ shadowY: v })} min={-10} max={10} step={1} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Animation</label>
                <Select value={style.animation} onValueChange={(v: CaptionStyle['animation']) => update({ animation: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    <SelectItem value="fade" className="text-xs">Fade</SelectItem>
                    <SelectItem value="slide-up" className="text-xs">Slide Up</SelectItem>
                    <SelectItem value="pop" className="text-xs">Pop/Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
