import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Kodak Portra',
  description: 'Warm portrait film stock style.',
  params: [{ id: 'warmth', label: 'Warmth', type: 'slider', defaultValue: 0.2, min: 0, max: 0.6, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=saturation=1.05:contrast=1.02,colortemperature=temperature=${5200 + Number(p.warmth) * 2000}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function KodakPortraTool() { return <GenericFilterTool config={config} />; }
