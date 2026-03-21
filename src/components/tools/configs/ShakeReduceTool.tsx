import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Shake Reduce',
  description: 'Reduce camera shake artifacts.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 8, min: 1, max: 20, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `deshake=rx=${p.strength}:ry=${p.strength}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ShakeReduceTool() { return <GenericFilterTool config={config} />; }
