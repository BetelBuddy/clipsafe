import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Countdown Timer',
  description: 'Burn a countdown timecode overlay on video.',
  params: [
    { id: 'start', label: 'Start From (seconds)', type: 'number', defaultValue: 10, min: 1, step: 1, placeholder: '10' },
    { id: 'fontSize', label: 'Font Size', type: 'slider', defaultValue: 48, min: 16, max: 120, step: 2 },
    { id: 'color', label: 'Color', type: 'text', defaultValue: 'white', placeholder: 'white' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='%{eif\\:${p.start}-t\\:d}':fontsize=${p.fontSize}:fontcolor=${p.color}:x=(w-text_w)/2:y=(h-text_h)/2`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CountdownTimerTool() { return <GenericFilterTool config={config} />; }
