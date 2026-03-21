import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Waveform Monitor',
  description: 'Waveform monitor analysis overlay.',
  params: [],
  buildArgs: (_p, ext) => ({ args: ['-i', 'input', '-vf', 'waveform=m=column', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function WaveformMonitorTool() { return <GenericFilterTool config={config} />; }
