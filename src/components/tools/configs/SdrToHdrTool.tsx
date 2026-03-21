import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'SDR to HDR',
  description: 'Boost SDR footage toward HDR-style contrast.',
  params: [{ id: 'boost', label: 'Boost', type: 'slider', defaultValue: 1.2, min: 1, max: 2, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=contrast=${p.boost}:brightness=0.02:saturation=1.15`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function SdrToHdrTool() { return <GenericFilterTool config={config} />; }
