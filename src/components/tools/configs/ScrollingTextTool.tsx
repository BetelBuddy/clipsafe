import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Scrolling Text',
  description: 'Scrolling marquee text overlay (credits-style).',
  params: [
    { id: 'text', label: 'Text', type: 'text', defaultValue: 'Your text here', placeholder: 'Enter text...' },
    { id: 'speed', label: 'Scroll Speed', type: 'slider', defaultValue: 50, min: 10, max: 200, step: 5 },
    { id: 'fontSize', label: 'Font Size', type: 'slider', defaultValue: 32, min: 12, max: 80, step: 2 },
    { id: 'color', label: 'Color', type: 'text', defaultValue: 'white', placeholder: 'white' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.fontSize}:fontcolor=${p.color}:x=(w-text_w)/2:y=h-${p.speed}*t`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ScrollingTextTool() { return <GenericFilterTool config={config} />; }
