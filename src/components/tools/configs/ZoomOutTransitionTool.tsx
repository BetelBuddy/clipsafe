import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Zoom Out Transition',
  description: 'Quick zoom-out transition style.',
  params: [{ id: 'pad', label: 'Padding', type: 'slider', defaultValue: 0.1, min: 0.02, max: 0.5, step: 0.01 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `pad=iw*(1+${p.pad}):ih*(1+${p.pad}):(ow-iw)/2:(oh-ih)/2:black`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ZoomOutTransitionTool() { return <GenericFilterTool config={config} />; }
