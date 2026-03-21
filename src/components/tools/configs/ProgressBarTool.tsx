import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Progress Bar',
  description: 'Animated progress bar that fills as the video plays.',
  params: [
    { id: 'color', label: 'Bar Color', type: 'select', defaultValue: 'red', options: [
      { label: 'Red', value: 'red' }, { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' }, { label: 'White', value: 'white' },
    ]},
    { id: 'height', label: 'Bar Height (px)', type: 'slider', defaultValue: 6, min: 2, max: 20, step: 1 },
    { id: 'position', label: 'Position', type: 'select', defaultValue: 'bottom', options: [
      { label: 'Bottom', value: 'bottom' }, { label: 'Top', value: 'top' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const h = p.height as number;
    const y = (p.position as string) === 'top' ? '0' : `ih-${h}`;
    return {
      args: ['-i', 'input', '-vf', `drawbox=x=0:y=${y}:w=iw*(t/duration):h=${h}:color=${p.color}:t=fill`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function ProgressBarTool() { return <GenericFilterTool config={config} />; }
