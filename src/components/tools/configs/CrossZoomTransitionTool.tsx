import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Cross Zoom Transition',
  description: 'Simulate a fast zoom transition feel.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 1.1, min: 1.01, max: 1.5, step: 0.01 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `scale=iw*${p.strength}:ih*${p.strength},crop=iw/${p.strength}:ih/${p.strength}` , '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CrossZoomTransitionTool() { return <GenericFilterTool config={config} />; }
