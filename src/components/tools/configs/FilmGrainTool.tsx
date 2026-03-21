import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Film Grain',
  description: 'Add noise overlay for a cinematic film grain look.',
  params: [
    { id: 'strength', label: 'Grain Strength', type: 'slider', defaultValue: 20, min: 5, max: 80, step: 5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `noise=alls=${p.strength}:allf=t`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FilmGrainTool() { return <GenericFilterTool config={config} />; }
