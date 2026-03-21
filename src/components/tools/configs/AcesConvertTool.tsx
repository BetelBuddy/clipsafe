import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'ACES Convert',
  description: 'ACES-style tonemapping approximation.',
  params: [{ id: 'desat', label: 'Desat', type: 'slider', defaultValue: 0.05, min: 0, max: 0.3, step: 0.01 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `tonemap=tonemap=hable:desat=${p.desat}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AcesConvertTool() { return <GenericFilterTool config={config} />; }
