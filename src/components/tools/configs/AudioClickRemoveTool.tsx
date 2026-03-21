import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Click Remove',
  description: 'Reduce clicks and crackles in audio.',
  params: [{ id: 'mix', label: 'Mix', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1, step: 0.1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-af', `adeclick=w=55:o=${p.mix}:a=1`, '-c:v', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AudioClickRemoveTool() { return <GenericFilterTool config={config} />; }
