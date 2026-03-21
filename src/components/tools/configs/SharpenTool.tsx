import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Sharpen',
  description: 'Sharpen your video using unsharp mask.',
  params: [
    { id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 3, min: 1, max: 10, step: 0.5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `unsharp=5:5:${p.intensity}:5:5:0`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SharpenTool() { return <GenericFilterTool config={config} />; }
