import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Halftone',
  description: 'Retro newspaper-style halftone dot effect.',
  params: [
    { id: 'dotSize', label: 'Dot Size', type: 'slider', defaultValue: 8, min: 2, max: 20, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const s = p.dotSize as number;
    return {
      args: ['-i', 'input', '-vf', `format=gray,scale=iw/${s}:ih/${s}:flags=neighbor,scale=iw*${s}:ih*${s}:flags=neighbor`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function HalftoneTool() { return <GenericFilterTool config={config} />; }
