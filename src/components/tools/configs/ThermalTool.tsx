import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Thermal / Heat Map',
  description: 'Apply a pseudocolor thermal heat map effect.',
  params: [
    { id: 'preset', label: 'Color Map', type: 'select', defaultValue: 'magma', options: [
      { label: 'Magma', value: 'magma' },
      { label: 'Inferno', value: 'inferno' },
      { label: 'Plasma', value: 'plasma' },
      { label: 'Viridis', value: 'viridis' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `pseudocolor=preset=${p.preset}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ThermalTool() { return <GenericFilterTool config={config} />; }
