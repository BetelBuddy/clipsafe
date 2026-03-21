import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Upscale AI',
  description: 'Upscale footage with sharpened detail enhancement.',
  params: [{ id: 'scale', label: 'Scale', type: 'select', defaultValue: '2', options: [{ label: '2x', value: '2' }, { label: '3x', value: '3' }] }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `scale=iw*${p.scale}:ih*${p.scale}:flags=lanczos,unsharp=5:5:1.0`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function UpscaleAiTool() { return <GenericFilterTool config={config} />; }
