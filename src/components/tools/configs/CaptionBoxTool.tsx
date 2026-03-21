import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Background Box',
  description: 'Captions with a colored background box behind the text.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 44, min: 16, max: 120, step: 2 },
    { id: 'boxcolor', label: 'Box Color', type: 'select', defaultValue: 'black@0.6', options: [
      { label: 'Black 60%', value: 'black@0.6' }, { label: 'Black 80%', value: 'black@0.8' },
      { label: 'Blue 60%', value: '0x003366@0.6' }, { label: 'Red 60%', value: '0x660000@0.6' },
      { label: 'White 60%', value: 'white@0.6' },
    ]},
    { id: 'boxborderw', label: 'Box Padding', type: 'slider', defaultValue: 10, min: 2, max: 30, step: 2 },
    { id: 'color', label: 'Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Black', value: 'black' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:box=1:boxcolor=${p.boxcolor}:boxborderw=${p.boxborderw}:x=(w-text_w)/2:y=h-80`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionBoxTool() { return <GenericFilterTool config={config} />; }
