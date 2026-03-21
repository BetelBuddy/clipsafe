import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Fade',
  description: 'Add a fade in/out transition to your video.',
  params: [
    { id: 'type', label: 'Fade Type', type: 'select', defaultValue: 'both', options: [
      { label: 'Fade In', value: 'in' },
      { label: 'Fade Out', value: 'out' },
      { label: 'Both', value: 'both' },
    ]},
    { id: 'duration', label: 'Duration (seconds)', type: 'slider', defaultValue: 1, min: 0.5, max: 5, step: 0.5 },
  ],
  buildArgs: (p, ext) => {
    const d = p.duration as number;
    let vf = '';
    if (p.type === 'in') vf = `fade=t=in:st=0:d=${d}`;
    else if (p.type === 'out') vf = `fade=t=out:st=0:d=${d}`;
    else vf = `fade=t=in:st=0:d=${d},fade=t=out:st=0:d=${d}`;
    return { args: ['-i', 'input', '-vf', vf, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function FadeTool() { return <GenericFilterTool config={config} />; }
