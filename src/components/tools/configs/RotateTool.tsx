import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Rotate',
  description: 'Rotate video by 90°, 180°, or 270°.',
  params: [
    { id: 'angle', label: 'Rotation', type: 'select', defaultValue: '1', options: [
      { label: '90° Clockwise', value: '1' },
      { label: '90° Counter-clockwise', value: '2' },
      { label: '180°', value: '3' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const transpose = p.angle === '3' ? 'transpose=1,transpose=1' : `transpose=${p.angle}`;
    return { args: ['-i', 'input', '-vf', transpose, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function RotateTool() { return <GenericFilterTool config={config} />; }
