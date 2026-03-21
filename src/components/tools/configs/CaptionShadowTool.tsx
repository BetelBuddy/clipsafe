import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Shadow',
  description: 'Captions with customizable drop shadow effect.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 16, max: 120, step: 2 },
    { id: 'shadowx', label: 'Shadow X Offset', type: 'slider', defaultValue: 3, min: 0, max: 10, step: 1 },
    { id: 'shadowy', label: 'Shadow Y Offset', type: 'slider', defaultValue: 3, min: 0, max: 10, step: 1 },
    { id: 'shadowcolor', label: 'Shadow Color', type: 'select', defaultValue: 'black@0.6', options: [
      { label: 'Black 60%', value: 'black@0.6' }, { label: 'Black 100%', value: 'black' },
      { label: 'Dark Blue', value: '0x000044@0.7' }, { label: 'Dark Red', value: '0x440000@0.7' },
    ]},
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:shadowcolor=${p.shadowcolor}:shadowx=${p.shadowx}:shadowy=${p.shadowy}:x=(w-text_w)/2:y=h-80`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionShadowTool() { return <GenericFilterTool config={config} />; }
