import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Step Printing',
  description: 'Drop frames for a stuttery stop-motion effect.',
  params: [
    { id: 'step', label: 'Frame Step (keep every Nth)', type: 'slider', defaultValue: 4, min: 2, max: 30, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `framestep=${p.step},setpts=N/FRAME_RATE/TB`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function StepPrintTool() { return <GenericFilterTool config={config} />; }
