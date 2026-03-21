import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Sepia',
  description: 'Apply a warm sepia tone.',
  params: [
    { id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 1, min: 0.1, max: 1, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SepiaTool() { return <GenericFilterTool config={config} />; }
