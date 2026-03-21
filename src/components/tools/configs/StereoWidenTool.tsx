import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Stereo Widen',
  description: 'Widen the stereo field.',
  params: [
    { id: 'level', label: 'Widen Level', type: 'slider', defaultValue: 1, min: 0.5, max: 4, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `stereotools=mlev=${p.level}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function StereoWidenTool() { return <GenericFilterTool config={config} />; }
