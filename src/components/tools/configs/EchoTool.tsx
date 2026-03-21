import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Echo',
  description: 'Add echo/reverb effect to audio.',
  params: [
    { id: 'delay', label: 'Delay (ms)', type: 'slider', defaultValue: 500, min: 50, max: 2000, step: 50 },
    { id: 'decay', label: 'Decay', type: 'slider', defaultValue: 0.5, min: 0.1, max: 0.9, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `aecho=0.8:0.9:${p.delay}:${p.decay}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function EchoTool() { return <GenericFilterTool config={config} />; }
