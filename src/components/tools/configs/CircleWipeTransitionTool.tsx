import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Circle Wipe Transition',
  description: 'Circular wipe-like transition treatment.',
  params: [{ id: 'radius', label: 'Radius', type: 'slider', defaultValue: 0.4, min: 0.1, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `vignette=angle=${p.radius}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function CircleWipeTransitionTool() { return <GenericFilterTool config={config} />; }
