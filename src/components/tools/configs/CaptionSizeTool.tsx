import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Size',
  description: 'Adjustable caption font size from tiny to massive.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 8, max: 200, step: 2 },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
    { id: 'borderw', label: 'Outline', type: 'slider', defaultValue: 2, min: 0, max: 8, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:borderw=${p.borderw}:bordercolor=black:x=(w-text_w)/2:y=h-text_h-40`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionSizeTool() { return <GenericFilterTool config={config} />; }
