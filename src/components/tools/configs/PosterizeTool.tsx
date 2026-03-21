import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Posterize',
  description: 'Reduce color palette for a poster art effect.',
  params: [
    { id: 'levels', label: 'Color Levels', type: 'slider', defaultValue: 4, min: 2, max: 16, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `format=rgb24,posterize=${p.levels}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function PosterizeTool() { return <GenericFilterTool config={config} />; }
