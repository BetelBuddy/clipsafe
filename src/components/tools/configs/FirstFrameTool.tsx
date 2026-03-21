import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'First Frame',
  description: 'Extract the first frame as a PNG image.',
  params: [],
  buildArgs: () => ({
    args: ['-i', 'input', '-vframes', '1', '-f', 'image2', 'output.png'],
    outputFileName: 'output.png',
  }),
};

export default function FirstFrameTool() { return <GenericFilterTool config={config} />; }
