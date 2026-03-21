import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Enhance',
  description: 'Automatically improve contrast, brightness, and color.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=contrast=${1 + Number(p.strength) * 0.2}:brightness=${Number(p.strength) * 0.03}:saturation=${1 + Number(p.strength) * 0.2}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AutoEnhanceTool() { return <GenericFilterTool config={config} />; }
