import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Position',
  description: 'Place captions at any position with preset locations.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 16, max: 120, step: 2 },
    { id: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-center', options: [
      { label: 'Top Center', value: 'top-center' },
      { label: 'Center', value: 'center' },
      { label: 'Bottom Center', value: 'bottom-center' },
      { label: 'Top Left', value: 'top-left' },
      { label: 'Bottom Right', value: 'bottom-right' },
    ]},
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Cyan', value: 'cyan' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const posMap: Record<string, string> = {
      'top-center': 'x=(w-text_w)/2:y=40',
      'center': 'x=(w-text_w)/2:y=(h-text_h)/2',
      'bottom-center': 'x=(w-text_w)/2:y=h-text_h-40',
      'top-left': 'x=20:y=40',
      'bottom-right': 'x=w-text_w-20:y=h-text_h-40',
    };
    const pos = posMap[p.position as string] || posMap['bottom-center'];
    return {
      args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:${pos}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function CaptionPositionTool() { return <GenericFilterTool config={config} />; }
