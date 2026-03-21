import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Boomerang',
  description: 'Play forward then in reverse for a boomerang loop.',
  params: [
    { id: 'loops', label: 'Loops', type: 'slider', defaultValue: 1, min: 1, max: 5, step: 1 },
  ],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-filter_complex', '[0:v]reverse[rv];[0:v][rv]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-an', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BoomerangTool() { return <GenericFilterTool config={config} />; }
