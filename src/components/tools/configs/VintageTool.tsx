import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Vintage',
  description: 'Apply a warm vintage/retro film look.',
  params: [
    { id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 0.6, min: 0.1, max: 1.0, step: 0.1 },
  ],
  buildArgs: (p, ext) => {
    const sat = 1 - (p.intensity as number) * 0.5;
    return {
      args: ['-i', 'input', '-vf', `eq=saturation=${sat.toFixed(2)}:gamma=1.1,colorbalance=rs=0.1:gs=-0.05:bs=-0.1,vignette=angle=0.4`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function VintageTool() { return <GenericFilterTool config={config} />; }
