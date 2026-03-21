import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Dead Pixel Fix',
  description: 'Reduce dead/hot pixel visibility.',
  params: [{ id: 'denoise', label: 'Denoise', type: 'slider', defaultValue: 4, min: 1, max: 20, step: 1 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `hqdn3d=${p.denoise}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function DeadPixelFixTool() { return <GenericFilterTool config={config} />; }
