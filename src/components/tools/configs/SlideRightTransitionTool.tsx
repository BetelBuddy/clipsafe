import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Slide Right Transition',
  description: 'Slide frame to the right for transition feel.',
  params: [{ id: 'offset', label: 'Offset', type: 'slider', defaultValue: 120, min: 20, max: 400, step: 10 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `crop=iw-${p.offset}:ih:0:0,pad=iw:ih:${p.offset}:0:black`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SlideRightTransitionTool() { return <GenericFilterTool config={config} />; }
