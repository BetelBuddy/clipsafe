import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Stroke',
  description: 'Thick stroke/outline text for maximum readability.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Bold Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 60, min: 20, max: 140, step: 2 },
    { id: 'borderw', label: 'Stroke Width', type: 'slider', defaultValue: 6, min: 2, max: 16, step: 1 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Red', value: 'red' },
    ]},
    { id: 'bordercolor', label: 'Stroke Color', type: 'select', defaultValue: 'black', options: [
      { label: 'Black', value: 'black' }, { label: 'Dark Blue', value: '0x001133' },
      { label: 'Dark Red', value: '0x330000' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:borderw=${p.borderw}:bordercolor=${p.bordercolor}:x=(w-text_w)/2:y=h-text_h-40`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionStrokeTool() { return <GenericFilterTool config={config} />; }
