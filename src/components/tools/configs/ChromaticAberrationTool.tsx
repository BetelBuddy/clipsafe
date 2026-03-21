import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Chromatic Aberration',
  description: 'RGB channel split for a strong chromatic aberration effect.',
  params: [
    { id: 'rh', label: 'Red Horizontal Offset', type: 'slider', defaultValue: 5, min: -20, max: 20, step: 1 },
    { id: 'bh', label: 'Blue Horizontal Offset', type: 'slider', defaultValue: -5, min: -20, max: 20, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `rgbashift=rh=${p.rh}:bh=${p.bh}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ChromaticAberrationTool() { return <GenericFilterTool config={config} />; }
