import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Speed',
  description: 'Change audio tempo without affecting pitch.',
  params: [
    { id: 'tempo', label: 'Tempo Multiplier', type: 'slider', defaultValue: 1, min: 0.5, max: 2, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `atempo=${p.tempo}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function AudioSpeedTool() { return <GenericFilterTool config={config} />; }
