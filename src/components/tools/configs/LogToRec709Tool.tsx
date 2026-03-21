import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Log to Rec709',
  description: 'Convert flat log-style footage to Rec709 look.',
  params: [{ id: 'gamma', label: 'Gamma', type: 'slider', defaultValue: 1.1, min: 0.8, max: 1.4, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=gamma=${p.gamma}:contrast=1.1:saturation=1.1`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function LogToRec709Tool() { return <GenericFilterTool config={config} />; }
