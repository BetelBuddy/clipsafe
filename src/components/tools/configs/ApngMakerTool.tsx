import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'APNG Maker',
  description: 'Convert video to animated PNG.',
  params: [
    { id: 'fps', label: 'Frame Rate', type: 'slider', defaultValue: 15, min: 5, max: 30, step: 1 },
    { id: 'width', label: 'Width', type: 'number', defaultValue: 480, min: 100, step: 10, placeholder: '480' },
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-vf', `fps=${p.fps},scale=${p.width}:-1`, '-plays', '0', 'output.apng'],
    outputFileName: 'output.apng',
  }),
};

export default function ApngMakerTool() { return <GenericFilterTool config={config} />; }
