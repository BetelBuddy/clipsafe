import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Reverse',
  description: 'Reverse only the audio track.',
  params: [],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-af', 'areverse', '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function AudioReverseTool() { return <GenericFilterTool config={config} />; }
