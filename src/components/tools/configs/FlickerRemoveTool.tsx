import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Flicker Remove',
  description: 'Reduce lighting flicker in footage.',
  params: [{ id: 'size', label: 'Temporal Size', type: 'slider', defaultValue: 8, min: 2, max: 20, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `deflicker=s=${p.size}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FlickerRemoveTool() { return <GenericFilterTool config={config} />; }
