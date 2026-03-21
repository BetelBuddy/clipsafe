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
import { Zap } from 'lucide-react';

export type ParamType = 'slider' | 'select' | 'number' | 'text' | 'toggle';

export interface ToolParam {
  id: string;
  label: string;
  type: ParamType;
  defaultValue: number | string | boolean;
  // Slider
  min?: number;
  max?: number;
  step?: number;
  // Select
  options?: { label: string; value: string }[];
  // Number
  placeholder?: string;
}

export interface FilterToolConfig {
  title: string;
  description: string;
  params: ToolParam[];
  buildArgs: (params: Record<string, number | string | boolean>, inputExt: string) => { args: string[]; outputFileName: string };
}

interface Props {
  config: FilterToolConfig;
}

export default function GenericFilterTool({ config }: Props) {
  const { file, fileUrl, isProcessing, outputUrl, outputSize, outputFileName, fileName } = useVideoStore();

  const [values, setValues] = useState<Record<string, number | string | boolean>>(() => {
    const init: Record<string, number | string | boolean> = {};
    config.params.forEach((p) => { init[p.id] = p.defaultValue; });
    return init;
  });

  const setValue = useCallback((id: string, val: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    const ext = fileName.split('.').pop() || 'mp4';
    const { args, outputFileName: outName } = config.buildArgs(values, ext);
    await runFFmpegCommand(file, args, outName);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{config.description}</p>
      </div>

      {!file && <FileDropZone />}

      {file && fileUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="rounded-lg overflow-hidden bg-card border border-border">
            <video src={fileUrl} controls className="w-full aspect-video object-contain bg-background" />
          </div>

          {/* Controls */}
          <div className="space-y-5 bg-card border border-border rounded-lg p-5">
            {config.params.map((param) => (
              <div key={param.id} className="space-y-2">
                <Label className="text-sm font-medium">{param.label}</Label>

                {param.type === 'slider' && (
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[values[param.id] as number]}
                      onValueChange={([v]) => setValue(param.id, v)}
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                      {values[param.id]}
                    </span>
                  </div>
                )}

                {param.type === 'select' && (
                  <Select value={values[param.id] as string} onValueChange={(v) => setValue(param.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {param.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {param.type === 'number' && (
                  <Input
                    type="number"
                    value={values[param.id] as number}
                    onChange={(e) => setValue(param.id, parseFloat(e.target.value) || 0)}
                    placeholder={param.placeholder}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                  />
                )}

                {param.type === 'text' && (
                  <Input
                    type="text"
                    value={values[param.id] as string}
                    onChange={(e) => setValue(param.id, e.target.value)}
                    placeholder={param.placeholder}
                  />
                )}

                {param.type === 'toggle' && (
                  <Switch
                    checked={values[param.id] as boolean}
                    onCheckedChange={(v) => setValue(param.id, v)}
                  />
                )}
              </div>
            ))}

            <Button onClick={handleProcess} disabled={isProcessing} className="w-full mt-4" size="lg">
              <Zap className="w-4 h-4 mr-2" />
              Apply {config.title}
            </Button>
          </div>
        </div>
      )}

      <ProcessingOverlay />
      {outputUrl && <DownloadOutput />}
    </div>
  );
}
