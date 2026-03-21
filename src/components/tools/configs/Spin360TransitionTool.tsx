import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Spin 360 Transition',
  description: 'Apply a rotating transition-like effect.',
  params: [{ id: 'speed', label: 'Spin Speed', type: 'slider', defaultValue: 1, min: 0.2, max: 4, step: 0.1 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `rotate=${p.speed}*t:c=black`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function Spin360TransitionTool() { return <GenericFilterTool config={config} />; }
