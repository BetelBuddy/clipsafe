import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Color Balance',
  description: 'Adjust shadow, midtone, and highlight RGB balance.',
  params: [
    { id: 'rs', label: 'Shadows Red', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
    { id: 'gs', label: 'Shadows Green', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
    { id: 'bs', label: 'Shadows Blue', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
    { id: 'rm', label: 'Midtones Red', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
    { id: 'gm', label: 'Midtones Green', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
    { id: 'bm', label: 'Midtones Blue', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `colorbalance=rs=${p.rs}:gs=${p.gs}:bs=${p.bs}:rm=${p.rm}:gm=${p.gm}:bm=${p.bm}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ColorBalanceTool() { return <GenericFilterTool config={config} />; }
