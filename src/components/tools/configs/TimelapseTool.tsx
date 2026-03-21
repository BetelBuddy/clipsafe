import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Timelapse',
  description: 'Speed up your video 2x to 32x for a timelapse effect.',
  params: [
    { id: 'speed', label: 'Speed Multiplier', type: 'slider', defaultValue: 4, min: 2, max: 32, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const pts = 1 / (p.speed as number);
    const atempo: string[] = [];
    let remaining = p.speed as number;
    while (remaining > 2) { atempo.push('atempo=2.0'); remaining /= 2; }
    atempo.push(`atempo=${remaining.toFixed(4)}`);
    return {
      args: ['-i', 'input', '-vf', `setpts=${pts.toFixed(6)}*PTS`, '-af', atempo.join(','), `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function TimelapseTool() { return <GenericFilterTool config={config} />; }
