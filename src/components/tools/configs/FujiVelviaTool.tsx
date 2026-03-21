import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Fuji Velvia',
  description: 'High-saturation landscape film style.',
  params: [{ id: 'sat', label: 'Saturation', type: 'slider', defaultValue: 1.2, min: 1, max: 1.8, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=saturation=${p.sat}:contrast=1.08`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FujiVelviaTool() { return <GenericFilterTool config={config} />; }
