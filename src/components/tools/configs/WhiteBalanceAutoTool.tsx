import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'White Balance Auto',
  description: 'Auto white balance correction.',
  params: [{ id: 'temp', label: 'Temperature', type: 'slider', defaultValue: 6500, min: 3000, max: 9000, step: 100 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `colortemperature=temperature=${p.temp}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function WhiteBalanceAutoTool() { return <GenericFilterTool config={config} />; }
