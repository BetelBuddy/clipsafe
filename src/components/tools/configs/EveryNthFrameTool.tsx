import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Every Nth Frame',
  description: 'Export every Nth frame as an image.',
  params: [
    { id: 'n', label: 'Every N Frames', type: 'slider', defaultValue: 30, min: 2, max: 300, step: 1 },
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-vf', `select=not(mod(n\\,${p.n}))`, '-vsync', 'vfr', 'frame_%04d.png'],
    outputFileName: 'frame_0001.png',
  }),
};

export default function EveryNthFrameTool() { return <GenericFilterTool config={config} />; }
