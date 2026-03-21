import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Frame at Time',
  description: 'Extract a frame at a specific timestamp.',
  params: [
    { id: 'time', label: 'Timestamp (seconds)', type: 'number', defaultValue: 1, min: 0, step: 0.1, placeholder: '1.0' },
  ],
  buildArgs: (p) => ({
    args: ['-ss', String(p.time), '-i', 'input', '-vframes', '1', '-f', 'image2', 'output.png'],
    outputFileName: 'output.png',
  }),
};

export default function FrameAtTimeTool() { return <GenericFilterTool config={config} />; }
