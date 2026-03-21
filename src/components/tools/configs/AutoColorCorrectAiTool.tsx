import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Color Correct AI',
  description: 'Auto color correction and balancing.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 0.6, min: 0.1, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `histeq=strength=${p.strength}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AutoColorCorrectAiTool() { return <GenericFilterTool config={config} />; }
