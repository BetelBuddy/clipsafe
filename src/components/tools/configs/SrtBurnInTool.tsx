import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'SRT Burn-In',
  description: 'Burn subtitle text into video with style options (simulated SRT).',
  params: [
    { id: 'text', label: 'Subtitle Text', type: 'text', defaultValue: 'Subtitle line here', placeholder: 'Enter subtitle...' },
    { id: 'startTime', label: 'Start Time (s)', type: 'number', defaultValue: 0, min: 0, placeholder: '0' },
    { id: 'endTime', label: 'End Time (s)', type: 'number', defaultValue: 5, min: 0, placeholder: '5' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 36, min: 16, max: 80, step: 2 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
    { id: 'boxEnabled', label: 'Background Box', type: 'toggle', defaultValue: true },
  ],
  buildArgs: (p, ext) => {
    const boxPart = p.boxEnabled ? ':box=1:boxcolor=black@0.5:boxborderw=8' : '';
    return {
      args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}${boxPart}:x=(w-text_w)/2:y=h-text_h-40:enable='between(t\\,${p.startTime}\\,${p.endTime})'`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function SrtBurnInTool() { return <GenericFilterTool config={config} />; }
