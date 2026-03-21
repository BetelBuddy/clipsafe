import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Hue Shift',
  description: 'Rotate the hue angle of the video.',
  params: [
    { id: 'angle', label: 'Hue Angle (degrees)', type: 'slider', defaultValue: 0, min: 0, max: 360, step: 5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `hue=h=${p.angle}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function HueShiftTool() { return <GenericFilterTool config={config} />; }
