import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Black & White',
  description: 'Convert video to grayscale.',
  params: [
    { id: 'contrast', label: 'Contrast Boost', type: 'slider', defaultValue: 1.0, min: 0.5, max: 2.0, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `eq=saturation=0:contrast=${p.contrast}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BlackWhiteTool() { return <GenericFilterTool config={config} />; }
