import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Zebra Stripes',
  description: 'Highlight overexposed regions with zebra stripes.',
  params: [{ id: 'thresh', label: 'Threshold', type: 'slider', defaultValue: 0.8, min: 0.1, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `lut=y='if(gte(val,${Number(p.thresh) * 255}),255,val)'`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function ZebraStripesTool() { return <GenericFilterTool config={config} />; }
