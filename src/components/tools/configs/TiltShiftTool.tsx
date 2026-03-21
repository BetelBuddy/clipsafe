import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Tilt Shift',
  description: 'Miniature/diorama look with selective focus blur.',
  params: [
    { id: 'focusY', label: 'Focus Position (%)', type: 'slider', defaultValue: 50, min: 10, max: 90, step: 5 },
    { id: 'blur', label: 'Blur Amount', type: 'slider', defaultValue: 10, min: 2, max: 30, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const blur = p.blur as number;
    const fy = (p.focusY as number) / 100;
    const band = 0.15;
    const top = Math.max(0, fy - band);
    const bottom = Math.min(1, fy + band);
    return {
      args: ['-i', 'input', '-vf', `split[a][b];[b]boxblur=${blur}[blurred];[a][blurred]overlay=0:0:enable='between(y/h,0,${top.toFixed(2)})+between(y/h,${bottom.toFixed(2)},1)'`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function TiltShiftTool() { return <GenericFilterTool config={config} />; }
