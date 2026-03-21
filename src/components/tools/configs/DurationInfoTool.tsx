import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Duration Info',
  description: 'Burn duration/codec info as text overlay on video.',
  params: [
    { id: 'fontSize', label: 'Font Size', type: 'slider', defaultValue: 24, min: 12, max: 72, step: 2 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='Duration\\: %{pts\\:hms}':fontsize=${p.fontSize}:fontcolor=white:x=10:y=10:box=1:boxcolor=black@0.6:boxborderw=5`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function DurationInfoTool() { return <GenericFilterTool config={config} />; }
