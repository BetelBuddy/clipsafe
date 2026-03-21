import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Film Print',
  description: 'Film print emulation with soft contrast.',
  params: [{ id: 'grain', label: 'Grain', type: 'slider', defaultValue: 8, min: 0, max: 30, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=contrast=1.08:saturation=1.1,noise=alls=${p.grain}:allf=t`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FilmPrintTool() { return <GenericFilterTool config={config} />; }
