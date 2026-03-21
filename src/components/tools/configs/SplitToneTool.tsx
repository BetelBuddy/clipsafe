import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Split Tone',
  description: 'Split-tone highlights and shadows.',
  params: [{ id: 'warm', label: 'Highlight Warmth', type: 'slider', defaultValue: 0.2, min: 0, max: 0.6, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `colorbalance=rh=${p.warm}:bh=-${p.warm}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function SplitToneTool() { return <GenericFilterTool config={config} />; }
