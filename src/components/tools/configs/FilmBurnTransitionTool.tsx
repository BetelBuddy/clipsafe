import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Film Burn Transition',
  description: 'Film burn styled transition look.',
  params: [{ id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 0.2, min: 0.05, max: 0.8, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=brightness=${p.intensity}:saturation=1.5`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FilmBurnTransitionTool() { return <GenericFilterTool config={config} />; }
