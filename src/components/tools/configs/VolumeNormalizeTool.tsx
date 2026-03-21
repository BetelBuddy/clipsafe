import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Volume Normalize',
  description: 'Normalize audio levels using loudnorm filter.',
  params: [
    { id: 'target', label: 'Target Loudness (LUFS)', type: 'slider', defaultValue: -14, min: -24, max: -5, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `loudnorm=I=${p.target}:TP=-1.5:LRA=11`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function VolumeNormalizeTool() { return <GenericFilterTool config={config} />; }
