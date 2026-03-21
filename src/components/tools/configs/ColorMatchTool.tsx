import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Color Match',
  description: 'Automatic color matching approximation.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 0.5, min: 0, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=saturation=${1 + Number(p.strength) * 0.2}:contrast=${1 + Number(p.strength) * 0.15}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ColorMatchTool() { return <GenericFilterTool config={config} />; }
