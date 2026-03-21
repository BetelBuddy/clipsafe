import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Last Frame',
  description: 'Extract the last frame as a PNG image.',
  params: [],
  buildArgs: () => ({
    args: ['-sseof', '-0.1', '-i', 'input', '-vframes', '1', '-f', 'image2', 'output.png'],
    outputFileName: 'output.png',
  }),
};

export default function LastFrameTool() { return <GenericFilterTool config={config} />; }
