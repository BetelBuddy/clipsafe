import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Picture in Picture',
  description: 'Overlay a smaller video on a main video (uses same file as demo).',
  params: [
    { id: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-right', options: [
      { label: 'Top Left', value: 'top-left' },
      { label: 'Top Right', value: 'top-right' },
      { label: 'Bottom Left', value: 'bottom-left' },
      { label: 'Bottom Right', value: 'bottom-right' },
    ]},
    { id: 'scale', label: 'PiP Scale (%)', type: 'slider', defaultValue: 25, min: 10, max: 50, step: 5 },
  ],
  buildArgs: (p, ext) => {
    const s = (p.scale as number) / 100;
    const posMap: Record<string, string> = {
      'top-left': '10:10',
      'top-right': 'W-w-10:10',
      'bottom-left': '10:H-h-10',
      'bottom-right': 'W-w-10:H-h-10',
    };
    const pos = posMap[p.position as string] || posMap['bottom-right'];
    return {
      args: ['-i', 'input', '-i', 'input', '-filter_complex', `[1:v]scale=iw*${s}:ih*${s}[pip];[0:v][pip]overlay=${pos}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function PipTool() { return <GenericFilterTool config={config} />; }
