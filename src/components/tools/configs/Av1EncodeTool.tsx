import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'AV1 Encode',
  description: 'Re-encode as AV1 for maximum compression.',
  params: [
    { id: 'crf', label: 'Quality (CRF)', type: 'slider', defaultValue: 30, min: 15, max: 63, step: 1 },
    { id: 'speed', label: 'Encoding Speed', type: 'slider', defaultValue: 6, min: 0, max: 8, step: 1 },
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-c:v', 'libaom-av1', '-crf', String(p.crf), '-cpu-used', String(p.speed), '-c:a', 'copy', 'output.mp4'],
    outputFileName: 'output.mp4',
  }),
};

export default function Av1EncodeTool() { return <GenericFilterTool config={config} />; }
