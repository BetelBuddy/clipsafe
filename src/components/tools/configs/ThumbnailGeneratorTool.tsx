import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Thumbnail Generator',
  description: 'Generate a social thumbnail frame.',
  params: [{ id: 'time', label: 'Time (s)', type: 'number', defaultValue: 1, min: 0, step: 0.1 }],
  buildArgs: (p) => ({ args: ['-ss', String(p.time), '-i', 'input', '-vframes', '1', 'output.jpg'], outputFileName: 'output.jpg' }),
};

export default function ThumbnailGeneratorTool() { return <GenericFilterTool config={config} />; }
