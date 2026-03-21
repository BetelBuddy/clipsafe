import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Whip Pan Transition',
  description: 'Fast horizontal whip-pan style blur.',
  params: [{ id: 'blur', label: 'Blur', type: 'slider', defaultValue: 20, min: 1, max: 60, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `boxblur=${p.blur}:1`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function WhipPanTransitionTool() { return <GenericFilterTool config={config} />; }
