import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'RGB Parade',
  description: 'RGB parade style analysis overlay.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'histogram=display_mode=parade:components=7', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function RgbParadeTool() { return <GenericFilterTool config={config} />; }
