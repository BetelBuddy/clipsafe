import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Border / Frame',
  description: 'Add a colored border around the video.',
  params: [
    { id: 'size', label: 'Border Size (px)', type: 'slider', defaultValue: 20, min: 2, max: 100, step: 2 },
    { id: 'color', label: 'Color', type: 'text', defaultValue: 'white', placeholder: 'white, black, red...' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `pad=iw+${Number(p.size)*2}:ih+${Number(p.size)*2}:${p.size}:${p.size}:color=${p.color}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BorderFrameTool() { return <GenericFilterTool config={config} />; }
