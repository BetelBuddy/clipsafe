import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Outline',
  description: 'Bold outlined captions with customizable border width and color.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 52, min: 16, max: 120, step: 2 },
    { id: 'borderw', label: 'Outline Width', type: 'slider', defaultValue: 4, min: 1, max: 12, step: 1 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Cyan', value: 'cyan' }, { label: 'Green', value: 'green' },
    ]},
    { id: 'bordercolor', label: 'Outline Color', type: 'select', defaultValue: 'black', options: [
      { label: 'Black', value: 'black' }, { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' }, { label: 'White', value: 'white' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:borderw=${p.borderw}:bordercolor=${p.bordercolor}:x=(w-text_w)/2:y=h-80`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionOutlineTool() { return <GenericFilterTool config={config} />; }
