import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Treble Boost',
  description: 'Boost high frequencies.',
  params: [
    { id: 'gain', label: 'Gain (dB)', type: 'slider', defaultValue: 5, min: 1, max: 20, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `treble=g=${p.gain}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function TrebleBoostTool() { return <GenericFilterTool config={config} />; }
