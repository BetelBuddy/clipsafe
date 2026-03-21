import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Crop',
  description: 'Crop video to a specific region. Set position and dimensions.',
  params: [
    { id: 'x', label: 'X Offset', type: 'number', defaultValue: 0, min: 0, placeholder: '0' },
    { id: 'y', label: 'Y Offset', type: 'number', defaultValue: 0, min: 0, placeholder: '0' },
    { id: 'w', label: 'Width', type: 'number', defaultValue: 640, min: 1, placeholder: '640' },
    { id: 'h', label: 'Height', type: 'number', defaultValue: 480, min: 1, placeholder: '480' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `crop=${p.w}:${p.h}:${p.x}:${p.y}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CropTool() { return <GenericFilterTool config={config} />; }
