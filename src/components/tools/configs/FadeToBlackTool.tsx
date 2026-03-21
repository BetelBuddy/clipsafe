import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Fade to Black',
  description: 'Fade video to black at the end.',
  params: [
    { id: 'start', label: 'Fade Start (seconds)', type: 'number', defaultValue: 3, min: 0, step: 0.5, placeholder: 'Start time' },
    { id: 'duration', label: 'Fade Duration (seconds)', type: 'slider', defaultValue: 2, min: 0.5, max: 10, step: 0.5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `fade=t=out:st=${p.start}:d=${p.duration}:color=black`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FadeToBlackTool() { return <GenericFilterTool config={config} />; }
