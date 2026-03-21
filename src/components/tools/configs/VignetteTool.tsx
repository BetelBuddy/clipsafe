import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Vignette',
  description: 'Add a dark vignette around edges.',
  params: [
    { id: 'angle', label: 'Intensity', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1.5, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `vignette=angle=${p.angle}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function VignetteTool() { return <GenericFilterTool config={config} />; }
