import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'LUT Import',
  description: 'Apply LUT-style cinematic grading preset.',
  params: [{ id: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 0.6, min: 0, max: 1, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=saturation=${1 + Number(p.intensity) * 0.3}:contrast=${1 + Number(p.intensity) * 0.2}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function LutImportTool() { return <GenericFilterTool config={config} />; }
