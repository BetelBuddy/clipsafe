import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Slow Motion',
  description: 'Slow your video down to 0.25x - 0.75x speed.',
  params: [
    { id: 'speed', label: 'Speed', type: 'slider', defaultValue: 0.5, min: 0.25, max: 0.75, step: 0.05 },
  ],
  buildArgs: (p, ext) => {
    const pts = 1 / (p.speed as number);
    return {
      args: ['-i', 'input', '-vf', `setpts=${pts.toFixed(4)}*PTS`, '-af', `atempo=${p.speed}`, `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function SlowMotionTool() { return <GenericFilterTool config={config} />; }
