import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Iris In Transition',
  description: 'Iris-in style reveal.',
  params: [{ id: 'amount', label: 'Amount', type: 'slider', defaultValue: 0.2, min: 0.05, max: 0.5, step: 0.01 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `crop=iw*(1-${p.amount}):ih*(1-${p.amount})`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function IrisInTransitionTool() { return <GenericFilterTool config={config} />; }
