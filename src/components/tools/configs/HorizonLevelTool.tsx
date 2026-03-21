import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Horizon Level',
  description: 'Correct slight horizon tilt.',
  params: [{ id: 'angle', label: 'Angle', type: 'slider', defaultValue: 1, min: -10, max: 10, step: 0.1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `rotate=${Number(p.angle)}*PI/180:c=black`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function HorizonLevelTool() { return <GenericFilterTool config={config} />; }
