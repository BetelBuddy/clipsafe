import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Levels',
  description: 'Automatically adjust contrast and brightness using histogram equalization.',
  params: [
    { id: 'strength', label: 'Strength', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1, step: 0.05 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `histeq=strength=${p.strength}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function AutoLevelsTool() { return <GenericFilterTool config={config} />; }
