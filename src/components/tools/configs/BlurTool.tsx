import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Blur',
  description: 'Apply Gaussian or box blur to your video.',
  params: [
    { id: 'type', label: 'Blur Type', type: 'select', defaultValue: 'gaussian', options: [
      { label: 'Gaussian', value: 'gaussian' },
      { label: 'Box', value: 'box' },
    ]},
    { id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 5, min: 1, max: 20, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const filter = p.type === 'box' ? `boxblur=${p.intensity}:${p.intensity}` : `gblur=sigma=${p.intensity}`;
    return { args: ['-i', 'input', '-vf', filter, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function BlurTool() { return <GenericFilterTool config={config} />; }
