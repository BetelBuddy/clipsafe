import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Video Stabilize',
  description: 'Stabilize shaky footage.',
  params: [{ id: 'smooth', label: 'Smoothing', type: 'slider', defaultValue: 10, min: 1, max: 30, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `deshake=rx=${p.smooth}:ry=${p.smooth}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function VideoStabilizeTool() { return <GenericFilterTool config={config} />; }
