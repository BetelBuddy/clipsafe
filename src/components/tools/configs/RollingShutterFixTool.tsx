import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Rolling Shutter Fix',
  description: 'Mitigate rolling shutter distortion.',
  params: [{ id: 'amount', label: 'Amount', type: 'slider', defaultValue: 0.2, min: 0, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `lenscorrection=k1=-${p.amount}:k2=${Number(p.amount) / 2}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function RollingShutterFixTool() { return <GenericFilterTool config={config} />; }
