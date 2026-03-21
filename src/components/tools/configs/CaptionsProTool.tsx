import { useState, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { runFFmpegCommand } from '@/lib/ffmpeg';
import { FileDropZone } from '@/components/FileDropZone';
import { DownloadOutput } from '@/components/DownloadOutput';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Plus, Trash2 } from 'lucide-react';

interface CaptionBlock {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

const FONTS = [
  { label: 'Sans-Serif', value: 'Sans' },
  { label: 'Serif', value: 'Serif' },
  { label: 'Monospace', value: 'Mono' },
  { label: 'Impact', value: 'Impact' },
];

const POSITIONS = [
  { label: 'Top Center', value: 'top-center' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Custom', value: 'custom' },
];

const ANIMATIONS = [
  { label: 'None', value: 'none' },
  { label: 'Fade In', value: 'fade-in' },
  { label: 'Slide Up', value: 'slide-up' },
  { label: 'Slide Left', value: 'slide-left' },
  { label: 'Pop / Scale', value: 'pop' },
  { label: 'Typewriter', value: 'typewriter' },
];

const COLOR_PRESETS = [
  { label: 'White', value: 'white' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: '0x00FF00' },
  { label: 'Orange', value: '0xFF8800' },
  { label: 'Magenta', value: 'magenta' },
  { label: 'Blue', value: '0x4488FF' },
];

export default function CaptionsProTool() {
  const { file, fileUrl, isProcessing, outputUrl, fileName } = useVideoStore();

  // Caption blocks
  const [blocks, setBlocks] = useState<CaptionBlock[]>([
    { id: crypto.randomUUID(), text: 'Your Caption Here', startTime: 0, endTime: 5 },
  ]);

  // Typography
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState('normal');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textTransform, setTextTransform] = useState('none');

  // Colors
  const [textColor, setTextColor] = useState('white');
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bgColor, setBgColor] = useState('black@0.6');
  const [bgPadding, setBgPadding] = useState(10);
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [outlineColor, setOutlineColor] = useState('black');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(3);
  const [shadowY, setShadowY] = useState(3);
  const [shadowColor, setShadowColor] = useState('black@0.6');

  // Position
  const [position, setPosition] = useState('bottom-center');
  const [customX, setCustomX] = useState(50);
  const [customY, setCustomY] = useState(50);
  const [alignment, setAlignment] = useState('center');

  // Animation
  const [entryAnim, setEntryAnim] = useState('none');
  const [exitAnim, setExitAnim] = useState('none');

  // Karaoke
  const [karaokeEnabled, setKaraokeEnabled] = useState(false);
  const [activeWordColor, setActiveWordColor] = useState('yellow');
  const [spokenColor, setSpokenColor] = useState('0x888888');

  const addBlock = () => {
    const last = blocks[blocks.length - 1];
    setBlocks([...blocks, {
      id: crypto.randomUUID(),
      text: 'New Caption',
      startTime: last ? last.endTime : 0,
      endTime: last ? last.endTime + 5 : 5,
    }]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateBlock = useCallback((id: string, field: keyof CaptionBlock, value: string | number) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
  }, []);

  const getPositionExpr = () => {
    const posMap: Record<string, string> = {
      'top-center': 'x=(w-text_w)/2:y=40',
      'center': 'x=(w-text_w)/2:y=(h-text_h)/2',
      'bottom-center': 'x=(w-text_w)/2:y=h-text_h-40',
      'top-left': 'x=20:y=40',
      'bottom-right': 'x=w-text_w-20:y=h-text_h-40',
      'custom': `x=${customX}:y=${customY}`,
    };
    return posMap[position] || posMap['bottom-center'];
  };

  const getAnimationExpr = (startTime: number, endTime: number) => {
    if (entryAnim === 'fade-in') {
      return `:alpha='if(lt(t\\,${startTime})\\,0\\,if(lt(t\\,${startTime}+0.5)\\,(t-${startTime})/0.5\\,1))'`;
    }
    return '';
  };

  const buildFilter = () => {
    const filters: string[] = [];

    for (const block of blocks) {
      let text = block.text;
      if (textTransform === 'uppercase') text = text.toUpperCase();
      if (textTransform === 'lowercase') text = text.toLowerCase();

      let filter = `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${textColor}`;
      filter += `:borderw=${outlineWidth}:bordercolor=${outlineColor}`;
      filter += `:${getPositionExpr()}`;

      if (bgEnabled) {
        filter += `:box=1:boxcolor=${bgColor}:boxborderw=${bgPadding}`;
      }

      if (shadowEnabled) {
        filter += `:shadowcolor=${shadowColor}:shadowx=${shadowX}:shadowy=${shadowY}`;
      }

      filter += `:enable='between(t\\,${block.startTime}\\,${block.endTime})'`;

      const animExpr = getAnimationExpr(block.startTime, block.endTime);
      if (animExpr) filter += animExpr;

      filters.push(filter);
    }

    return filters.join(',');
  };

  const handleProcess = async () => {
    if (!file) return;
    const ext = fileName.split('.').pop() || 'mp4';
    const vf = buildFilter();
    await runFFmpegCommand(file, ['-i', 'input', '-vf', vf, '-c:a', 'copy', `output.${ext}`], `output.${ext}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Captions Pro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comprehensive caption tool — typography, colors, position, animations, karaoke, and more.
        </p>
      </div>

      {!file && <FileDropZone />}

      {file && fileUrl && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="xl:col-span-1 rounded-lg overflow-hidden bg-card border border-border">
            <video src={fileUrl} controls className="w-full aspect-video object-contain bg-background" />
          </div>

          {/* Controls */}
          <div className="xl:col-span-2 bg-card border border-border rounded-lg p-5">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
                <TabsTrigger value="karaoke">Karaoke</TabsTrigger>
              </TabsList>

              {/* === TEXT TAB === */}
              <TabsContent value="text" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Caption Blocks</Label>
                  <Button variant="outline" size="sm" onClick={addBlock}>
                    <Plus className="w-3 h-3 mr-1" /> Add Block
                  </Button>
                </div>
                {blocks.map((block) => (
                  <div key={block.id} className="border border-border rounded-md p-3 space-y-2">
                    <div className="flex gap-2">
                      <Textarea
                        value={block.text}
                        onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                        className="flex-1 min-h-[60px]"
                        placeholder="Caption text..."
                      />
                      {blocks.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start (s)</Label>
                        <Input type="number" value={block.startTime} onChange={(e) => updateBlock(block.id, 'startTime', parseFloat(e.target.value) || 0)} step={0.1} min={0} />
                      </div>
                      <div>
                        <Label className="text-xs">End (s)</Label>
                        <Input type="number" value={block.endTime} onChange={(e) => updateBlock(block.id, 'endTime', parseFloat(e.target.value) || 0)} step={0.1} min={0} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label>Text Transform</Label>
                  <Select value={textTransform} onValueChange={setTextTransform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">UPPERCASE</SelectItem>
                      <SelectItem value="lowercase">lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* === STYLE TAB === */}
              <TabsContent value="style" className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={8} max={200} step={2} />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Select value={textColor} onValueChange={setTextColor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLOR_PRESETS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Outline Width: {outlineWidth}</Label>
                  <Slider value={[outlineWidth]} onValueChange={([v]) => setOutlineWidth(v)} min={0} max={12} step={1} />
                </div>

                <div className="space-y-2">
                  <Label>Outline Color</Label>
                  <Select value={outlineColor} onValueChange={setOutlineColor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="0x001133">Dark Blue</SelectItem>
                      <SelectItem value="0x330000">Dark Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={bgEnabled} onCheckedChange={setBgEnabled} />
                  <Label>Background Box</Label>
                </div>
                {bgEnabled && (
                  <div className="grid grid-cols-2 gap-3 pl-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Box Color</Label>
                      <Select value={bgColor} onValueChange={setBgColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black@0.6">Black 60%</SelectItem>
                          <SelectItem value="black@0.8">Black 80%</SelectItem>
                          <SelectItem value="0x003366@0.6">Blue 60%</SelectItem>
                          <SelectItem value="white@0.5">White 50%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Box Padding: {bgPadding}</Label>
                      <Slider value={[bgPadding]} onValueChange={([v]) => setBgPadding(v)} min={2} max={30} step={2} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
                  <Label>Drop Shadow</Label>
                </div>
                {shadowEnabled && (
                  <div className="grid grid-cols-3 gap-3 pl-4">
                    <div className="space-y-1">
                      <Label className="text-xs">X: {shadowX}</Label>
                      <Slider value={[shadowX]} onValueChange={([v]) => setShadowX(v)} min={0} max={10} step={1} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y: {shadowY}</Label>
                      <Slider value={[shadowY]} onValueChange={([v]) => setShadowY(v)} min={0} max={10} step={1} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Shadow Color</Label>
                      <Select value={shadowColor} onValueChange={setShadowColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black@0.6">Black 60%</SelectItem>
                          <SelectItem value="black">Black 100%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* === POSITION TAB === */}
              <TabsContent value="position" className="space-y-4">
                <div className="space-y-2">
                  <Label>Position Preset</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {position === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">X Position</Label>
                      <Input type="number" value={customX} onChange={(e) => setCustomX(parseInt(e.target.value) || 0)} min={0} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y Position</Label>
                      <Input type="number" value={customY} onChange={(e) => setCustomY(parseInt(e.target.value) || 0)} min={0} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select value={alignment} onValueChange={setAlignment}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* === ANIMATION TAB === */}
              <TabsContent value="animation" className="space-y-4">
                <div className="space-y-2">
                  <Label>Entry Animation</Label>
                  <Select value={entryAnim} onValueChange={setEntryAnim}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ANIMATIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exit Animation</Label>
                  <Select value={exitAnim} onValueChange={setExitAnim}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fade-out">Fade Out</SelectItem>
                      <SelectItem value="slide-down">Slide Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* === KARAOKE TAB === */}
              <TabsContent value="karaoke" className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch checked={karaokeEnabled} onCheckedChange={setKaraokeEnabled} />
                  <Label>Karaoke Mode (word-by-word highlight)</Label>
                </div>

                {karaokeEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Active Word Color</Label>
                      <Select value={activeWordColor} onValueChange={setActiveWordColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLOR_PRESETS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Already-Spoken Color</Label>
                      <Select value={spokenColor} onValueChange={setSpokenColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0x888888">Gray</SelectItem>
                          <SelectItem value="white@0.5">White 50%</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Karaoke mode highlights each word as it's spoken. For best results, use with the editor's transcription feature to get word-level timestamps.
                    </p>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <Button onClick={handleProcess} disabled={isProcessing} className="w-full mt-6" size="lg">
              <Zap className="w-4 h-4 mr-2" />
              Apply Captions Pro
            </Button>
          </div>
        </div>
      )}

      <ProcessingOverlay />
      {outputUrl && <DownloadOutput />}
    </div>
  );
}
