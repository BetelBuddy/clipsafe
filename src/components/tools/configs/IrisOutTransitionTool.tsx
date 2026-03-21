import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Iris Out Transition',
  description: 'Iris-out style closure.',
  params: [{ id: 'amount', label: 'Amount', type: 'slider', defaultValue: 0.2, min: 0.05, max: 0.5, step: 0.01 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `pad=iw*(1+${p.amount}):ih*(1+${p.amount}):(ow-iw)/2:(oh-ih)/2:black`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function IrisOutTransitionTool() { return <GenericFilterTool config={config} />; }
