import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Fade Black Transition',
  description: 'Apply a fade-to-black transition effect.',
  params: [{ id: 'duration', label: 'Duration (s)', type: 'slider', defaultValue: 1, min: 0.2, max: 3, step: 0.1 }],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `fade=t=out:st=0:d=${p.duration}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FadeBlackTransitionTool() { return <GenericFilterTool config={config} />; }
