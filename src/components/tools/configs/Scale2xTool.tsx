import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Scale 2x',
  description: 'Double the resolution with high-quality lanczos upscale.',
  params: [],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-vf', 'scale=iw*2:ih*2:flags=lanczos', '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function Scale2xTool() { return <GenericFilterTool config={config} />; }
