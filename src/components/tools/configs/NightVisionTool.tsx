import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Night Vision',
  description: 'Green-tinted night vision camera effect with noise.',
  params: [
    { id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 80, min: 20, max: 100, step: 5 },
  ],
  buildArgs: (p, ext) => {
    const noise = Math.round((p.intensity as number) / 5);
    return {
      args: ['-i', 'input', '-vf', `colorchannelmixer=rr=0:rg=0:rb=0:gr=0.3:gg=1:gb=0.3:br=0:bg=0:bb=0,noise=alls=${noise}:allf=t`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function NightVisionTool() { return <GenericFilterTool config={config} />; }
