import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Text Overlay',
  description: 'Burn text onto your video with customizable style.',
  params: [
    { id: 'text', label: 'Text', type: 'text', defaultValue: 'Your Text Here', placeholder: 'Enter text...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 12, max: 120, step: 2 },
    { id: 'x', label: 'X Position', type: 'number', defaultValue: 50, min: 0, placeholder: '50' },
    { id: 'y', label: 'Y Position', type: 'number', defaultValue: 50, min: 0, placeholder: '50' },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' },
      { label: 'Black', value: 'black' },
      { label: 'Yellow', value: 'yellow' },
      { label: 'Red', value: 'red' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:x=${p.x}:y=${p.y}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function TextOverlayTool() { return <GenericFilterTool config={config} />; }
