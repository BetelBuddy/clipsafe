import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Glitch Transition',
  description: 'Glitch-like transition effect.',
  params: [{ id: 'amount', label: 'Amount', type: 'slider', defaultValue: 5, min: 1, max: 20, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `rgbashift=rh=${p.amount}:bh=-${p.amount}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function GlitchTransitionTool() { return <GenericFilterTool config={config} />; }
