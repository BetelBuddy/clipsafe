import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Bitrate Graph',
  description: 'Generate a bitrate analysis graph overlay.',
  params: [],
  buildArgs: (_p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='Bitrate\\: %{pkt_size}':fontsize=20:fontcolor=lime:x=10:y=h-30:box=1:boxcolor=black@0.5:boxborderw=3`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BitrateGraphTool() { return <GenericFilterTool config={config} />; }
