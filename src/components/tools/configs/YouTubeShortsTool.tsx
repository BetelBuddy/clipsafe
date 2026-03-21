import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'YouTube Shorts',
  description: 'Export vertical Shorts format.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function YouTubeShortsTool() { return <GenericFilterTool config={config} />; }
