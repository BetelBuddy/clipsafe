import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Flip',
  description: 'Flip video horizontally or vertically.',
  params: [
    { id: 'direction', label: 'Direction', type: 'select', defaultValue: 'hflip', options: [
      { label: 'Horizontal', value: 'hflip' },
      { label: 'Vertical', value: 'vflip' },
      { label: 'Both', value: 'hflip,vflip' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', p.direction as string, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FlipTool() { return <GenericFilterTool config={config} />; }
