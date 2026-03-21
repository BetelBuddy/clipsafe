import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Invert / Negative',
  description: 'Invert all colors for a negative effect.',
  params: [],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-vf', 'negate', '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function InvertTool() { return <GenericFilterTool config={config} />; }
