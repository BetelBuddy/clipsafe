import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Cinematic Orange Teal',
  description: 'Apply a classic orange-teal cinematic look.',
  params: [{ id: 'strength', label: 'Strength', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `colorbalance=rs=${p.strength}:bs=-${p.strength}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function CinematicOrangeTealTool() { return <GenericFilterTool config={config} />; }
