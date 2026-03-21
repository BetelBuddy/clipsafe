import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Twitter/X Video',
  description: 'Export in a Twitter/X-friendly ratio.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function TwitterXVideoTool() { return <GenericFilterTool config={config} />; }
