import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Gradient BG',
  description: 'Captions with a gradient background bar behind the text.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 44, min: 16, max: 100, step: 2 },
    { id: 'barHeight', label: 'Bar Height', type: 'slider', defaultValue: 60, min: 30, max: 120, step: 5 },
    { id: 'opacity', label: 'Bar Opacity', type: 'slider', defaultValue: 0.7, min: 0.1, max: 1, step: 0.05 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const bh = p.barHeight as number;
    const barY = `h-${bh + 20}`;
    return {
      args: ['-i', 'input', '-vf', `drawbox=x=0:y=${barY}:w=iw:h=${bh}:color=black@${p.opacity}:t=fill,drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:x=(w-text_w)/2:y=${barY}+${Math.round(bh / 2 - (p.size as number) / 2)}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function CaptionGradientBgTool() { return <GenericFilterTool config={config} />; }
