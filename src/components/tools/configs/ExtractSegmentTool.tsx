import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Extract Segment',
  description: 'Extract a time range without re-encoding.',
  params: [
    { id: 'start', label: 'Start Time (seconds)', type: 'number', defaultValue: 0, min: 0, step: 0.1, placeholder: '0' },
    { id: 'end', label: 'End Time (seconds)', type: 'number', defaultValue: 10, min: 0, step: 0.1, placeholder: '10' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-ss', String(p.start), '-i', 'input', '-to', String(Number(p.end) - Number(p.start)), '-c', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ExtractSegmentTool() { return <GenericFilterTool config={config} />; }
