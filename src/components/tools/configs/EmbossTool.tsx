import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Emboss',
  description: 'Apply a convolution-based emboss effect.',
  params: [],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-vf', 'convolution=-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2', '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function EmbossTool() { return <GenericFilterTool config={config} />; }
