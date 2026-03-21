import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Slide Up Transition',
  description: 'Slide frame upward for transition feel.',
  params: [{ id: 'offset', label: 'Offset', type: 'slider', defaultValue: 80, min: 20, max: 300, step: 10 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `crop=iw:ih-${p.offset}:0:${p.offset},pad=iw:ih:0:0:black`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SlideUpTransitionTool() { return <GenericFilterTool config={config} />; }
