import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Lens Correction',
  description: 'Fix barrel or pincushion distortion from wide-angle lenses.',
  params: [
    { id: 'k1', label: 'K1 (Barrel)', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.05 },
    { id: 'k2', label: 'K2 (Pincushion)', type: 'slider', defaultValue: 0, min: -1, max: 1, step: 0.05 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `lenscorrection=k1=${p.k1}:k2=${p.k2}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function LensCorrectionTool() { return <GenericFilterTool config={config} />; }
