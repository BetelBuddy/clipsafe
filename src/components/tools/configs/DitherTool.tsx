import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Dither',
  description: 'Apply an ordered dither effect for a retro look.',
  params: [
    { id: 'colors', label: 'Color Levels', type: 'slider', defaultValue: 4, min: 2, max: 16, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `posterize=${p.colors}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function DitherTool() { return <GenericFilterTool config={config} />; }
