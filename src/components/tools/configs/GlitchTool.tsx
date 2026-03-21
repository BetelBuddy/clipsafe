import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Glitch',
  description: 'RGB channel offset for a glitch art effect.',
  params: [
    { id: 'offset', label: 'RGB Offset', type: 'slider', defaultValue: 5, min: 1, max: 30, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const o = p.offset as number;
    return {
      args: ['-i', 'input', '-vf', `rgbashift=rh=${o}:bh=-${o}:rv=${Math.round(o/2)}:bv=-${Math.round(o/2)}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function GlitchTool() { return <GenericFilterTool config={config} />; }
