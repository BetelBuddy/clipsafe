import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Extract Frames',
  description: 'Export frames as a sequence of images.',
  params: [
    { id: 'fps', label: 'Frames Per Second', type: 'slider', defaultValue: 1, min: 1, max: 30, step: 1 },
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-vf', `fps=${p.fps}`, 'frame_%04d.png'],
    outputFileName: 'frame_0001.png',
  }),
};

export default function ExtractFramesTool() { return <GenericFilterTool config={config} />; }
