import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Pad',
  description: 'Add letterbox or pillarbox padding around your video.',
  params: [
    { id: 'w', label: 'Output Width', type: 'number', defaultValue: 1920, min: 1, placeholder: '1920' },
    { id: 'h', label: 'Output Height', type: 'number', defaultValue: 1080, min: 1, placeholder: '1080' },
    { id: 'color', label: 'Pad Color', type: 'select', defaultValue: 'black', options: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Gray', value: 'gray' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `pad=${p.w}:${p.h}:(ow-iw)/2:(oh-ih)/2:${p.color}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function PadTool() { return <GenericFilterTool config={config} />; }
