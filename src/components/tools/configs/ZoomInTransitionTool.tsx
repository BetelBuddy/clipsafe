import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Zoom In Transition',
  description: 'Quick zoom-in transition style.',
  params: [{ id: 'scale', label: 'Scale', type: 'slider', defaultValue: 1.2, min: 1.05, max: 2, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `scale=iw*${p.scale}:ih*${p.scale},crop=iw/${p.scale}:ih/${p.scale}` , '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ZoomInTransitionTool() { return <GenericFilterTool config={config} />; }
