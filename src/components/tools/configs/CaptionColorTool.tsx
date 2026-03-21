import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Color',
  description: 'Colored captions with preset and custom color options.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 16, max: 120, step: 2 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Cyan', value: 'cyan' }, { label: 'Lime', value: '0x00FF00' },
      { label: 'Magenta', value: 'magenta' }, { label: 'Orange', value: '0xFF8800' },
      { label: 'Red', value: 'red' }, { label: 'Blue', value: '0x4488FF' },
    ]},
    { id: 'borderw', label: 'Outline', type: 'slider', defaultValue: 2, min: 0, max: 8, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:borderw=${p.borderw}:bordercolor=black:x=(w-text_w)/2:y=h-80`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionColorTool() { return <GenericFilterTool config={config} />; }
