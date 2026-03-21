import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Facebook Cover',
  description: 'Export video sized for Facebook cover use.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'scale=820:312:force_original_aspect_ratio=decrease,pad=820:312:(ow-iw)/2:(oh-ih)/2:black', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FacebookCoverTool() { return <GenericFilterTool config={config} />; }
