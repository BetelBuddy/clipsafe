import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Clock Wipe Transition',
  description: 'Clock-hand style transition effect.',
  params: [{ id: 'speed', label: 'Speed', type: 'slider', defaultValue: 1, min: 0.2, max: 3, step: 0.1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `rotate=${p.speed}*t:c=black`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ClockWipeTransitionTool() { return <GenericFilterTool config={config} />; }
