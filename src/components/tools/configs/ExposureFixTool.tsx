import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Exposure Fix',
  description: 'Quick exposure correction.',
  params: [{ id: 'ev', label: 'Exposure EV', type: 'slider', defaultValue: 0, min: -2, max: 2, step: 0.1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=brightness=${Number(p.ev) * 0.08}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ExposureFixTool() { return <GenericFilterTool config={config} />; }
