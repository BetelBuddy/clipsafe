import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Motion Blur',
  description: 'Temporal frame blending for a cinematic motion blur effect.',
  params: [
    { id: 'mode', label: 'Blend Mode', type: 'select', defaultValue: 'average', options: [
      { label: 'Average', value: 'average' },
      { label: 'Darken', value: 'darken' },
      { label: 'Lighten', value: 'lighten' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `tblend=all_mode=${p.mode}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function MotionBlurTool() { return <GenericFilterTool config={config} />; }
