import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Solarize',
  description: 'Invert pixels above a brightness threshold.',
  params: [
    { id: 'threshold', label: 'Threshold', type: 'slider', defaultValue: 128, min: 0, max: 255, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `lutrgb=r=if(gt(val\\,${p.threshold})\\,255-val\\,val):g=if(gt(val\\,${p.threshold})\\,255-val\\,val):b=if(gt(val\\,${p.threshold})\\,255-val\\,val)`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SolarizeTool() { return <GenericFilterTool config={config} />; }
