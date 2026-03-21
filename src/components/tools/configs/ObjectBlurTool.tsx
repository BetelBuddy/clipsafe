import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Object Blur',
  description: 'Apply object-area blur approximation.',
  params: [{ id: 'amount', label: 'Blur Amount', type: 'slider', defaultValue: 10, min: 1, max: 40, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `boxblur=${p.amount}:1`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ObjectBlurTool() { return <GenericFilterTool config={config} />; }
