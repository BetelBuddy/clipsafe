import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Animated Caption Slide',
  description: 'Captions that slide in from the side with animation.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Slide In!', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 52, min: 16, max: 120, step: 2 },
    { id: 'direction', label: 'Slide Direction', type: 'select', defaultValue: 'left', options: [
      { label: 'From Left', value: 'left' }, { label: 'From Right', value: 'right' },
      { label: 'From Top', value: 'top' }, { label: 'From Bottom', value: 'bottom' },
    ]},
    { id: 'speed', label: 'Slide Speed', type: 'slider', defaultValue: 200, min: 50, max: 600, step: 25 },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const spd = p.speed as number;
    const posMap: Record<string, string> = {
      left: `x='min((w-text_w)/2\\, -text_w+${spd}*t)':y=h-80`,
      right: `x='max((w-text_w)/2\\, w-${spd}*t)':y=h-80`,
      top: `x=(w-text_w)/2:y='min(h-80\\, -text_h+${spd}*t)'`,
      bottom: `x=(w-text_w)/2:y='max(h-80\\, h-${spd}*t)'`,
    };
    const pos = posMap[p.direction as string] || posMap.left;
    return {
      args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:borderw=2:bordercolor=black:${pos}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function AnimatedCaptionSlideTool() { return <GenericFilterTool config={config} />; }
