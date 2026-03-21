import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Fade',
  description: 'Fade audio in and/or out smoothly.',
  params: [
    { id: 'type', label: 'Fade Type', type: 'select', defaultValue: 'both', options: [
      { label: 'Fade In', value: 'in' },
      { label: 'Fade Out', value: 'out' },
      { label: 'Both', value: 'both' },
    ]},
    { id: 'duration', label: 'Duration (seconds)', type: 'slider', defaultValue: 2, min: 0.5, max: 10, step: 0.5 },
  ],
  buildArgs: (p, ext) => {
    const d = p.duration as number;
    let af = '';
    if (p.type === 'in') af = `afade=t=in:st=0:d=${d}`;
    else if (p.type === 'out') af = `afade=t=out:st=0:d=${d}`;
    else af = `afade=t=in:st=0:d=${d},afade=t=out:st=0:d=${d}`;
    return { args: ['-i', 'input', '-af', af, '-c:v', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function AudioFadeTool() { return <GenericFilterTool config={config} />; }
