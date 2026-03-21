import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Uppercase Captions',
  description: 'Force uppercase text overlay for bold impact captions.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'your caption here', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 56, min: 20, max: 140, step: 2 },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Red', value: 'red' },
    ]},
    { id: 'borderw', label: 'Outline', type: 'slider', defaultValue: 3, min: 0, max: 10, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const upper = (p.text as string).toUpperCase();
    return {
      args: ['-i', 'input', '-vf', `drawtext=text='${upper}':fontsize=${p.size}:fontcolor=${p.color}:borderw=${p.borderw}:bordercolor=black:x=(w-text_w)/2:y=h-text_h-40`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function UppercaseCaptionsTool() { return <GenericFilterTool config={config} />; }
