import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Kodachrome',
  description: 'Classic Kodachrome-inspired contrast.',
  params: [{ id: 'contrast', label: 'Contrast', type: 'slider', defaultValue: 1.15, min: 1, max: 1.5, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=contrast=${p.contrast}:saturation=1.1`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function KodachromeTool() { return <GenericFilterTool config={config} />; }
