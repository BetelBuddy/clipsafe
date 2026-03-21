import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Vectorscope',
  description: 'Vectorscope analysis overlay.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'vectorscope=m=color3', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function VectorscopeTool() { return <GenericFilterTool config={config} />; }
