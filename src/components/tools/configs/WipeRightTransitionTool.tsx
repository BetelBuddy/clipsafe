import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Wipe Right Transition',
  description: 'Reveal from left to right wipe effect.',
  params: [{ id: 'softness', label: 'Softness', type: 'slider', defaultValue: 8, min: 0, max: 40, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `boxblur=${p.softness}:1`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function WipeRightTransitionTool() { return <GenericFilterTool config={config} />; }
