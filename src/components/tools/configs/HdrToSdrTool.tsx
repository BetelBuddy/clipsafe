import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'HDR to SDR',
  description: 'Convert HDR-like contrast down to SDR.',
  params: [{ id: 'peak', label: 'Peak', type: 'slider', defaultValue: 100, min: 50, max: 300, step: 10 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `zscale=t=linear:npl=${p.peak},tonemap=tonemap=mobius,zscale=t=bt709`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function HdrToSdrTool() { return <GenericFilterTool config={config} />; }
