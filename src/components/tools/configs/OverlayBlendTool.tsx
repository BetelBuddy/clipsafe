import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Overlay Blend',
  description: 'Blend the video with itself using a blend mode.',
  params: [
    { id: 'mode', label: 'Blend Mode', type: 'select', defaultValue: 'addition', options: [
      { label: 'Addition', value: 'addition' },
      { label: 'Multiply', value: 'multiply' },
      { label: 'Screen', value: 'screen' },
      { label: 'Difference', value: 'difference' },
    ]},
    { id: 'opacity', label: 'Opacity', type: 'slider', defaultValue: 0.5, min: 0, max: 1, step: 0.05 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-filter_complex', `[0:v]split[a][b];[a][b]blend=all_mode=${p.mode}:all_opacity=${p.opacity}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function OverlayBlendTool() { return <GenericFilterTool config={config} />; }
