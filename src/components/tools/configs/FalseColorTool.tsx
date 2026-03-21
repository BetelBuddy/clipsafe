import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'False Color',
  description: 'False-color exposure visualization.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'pseudocolor=preset=viridis', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FalseColorTool() { return <GenericFilterTool config={config} />; }
