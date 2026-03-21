import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Oil Paint',
  description: 'Smooth oil painting effect using heavy blur and edge enhancement.',
  params: [
    { id: 'radius', label: 'Radius', type: 'slider', defaultValue: 5, min: 1, max: 15, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const r = p.radius as number;
    return {
      args: ['-i', 'input', '-vf', `boxblur=luma_radius=${r}:chroma_radius=${r},unsharp=5:5:1.5`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function OilPaintTool() { return <GenericFilterTool config={config} />; }
