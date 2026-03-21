import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Freeze Frame',
  description: 'Extract a single frame and hold it for N seconds.',
  params: [
    { id: 'time', label: 'Frame Time (seconds)', type: 'number', defaultValue: 0, min: 0, step: 0.1, placeholder: '0' },
    { id: 'duration', label: 'Hold Duration (seconds)', type: 'slider', defaultValue: 3, min: 1, max: 30, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-ss', String(p.time), '-i', 'input', '-vframes', '1', '-vf', `loop=${Number(p.duration) * 25}:1:0`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FreezeFrameTool() { return <GenericFilterTool config={config} />; }
