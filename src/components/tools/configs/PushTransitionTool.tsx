import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Push Transition',
  description: 'Push-style horizontal transition effect.',
  params: [{ id: 'amount', label: 'Push Amount', type: 'slider', defaultValue: 0.1, min: 0.02, max: 0.5, step: 0.01 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `crop=iw*(1-${p.amount}):ih`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function PushTransitionTool() { return <GenericFilterTool config={config} />; }
