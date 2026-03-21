import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Bass Boost',
  description: 'Boost bass frequencies for deeper sound.',
  params: [
    { id: 'gain', label: 'Gain (dB)', type: 'slider', defaultValue: 10, min: 1, max: 20, step: 1 },
    { id: 'freq', label: 'Frequency (Hz)', type: 'slider', defaultValue: 100, min: 40, max: 300, step: 10 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `bass=g=${p.gain}:f=${p.freq}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BassBoostTool() { return <GenericFilterTool config={config} />; }
