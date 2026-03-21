import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'De-Esser',
  description: 'Reduce harsh sibilance (s, sh, ch sounds) in speech.',
  params: [
    { id: 'threshold', label: 'Threshold', type: 'slider', defaultValue: 0.5, min: 0.1, max: 1, step: 0.05 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `highpass=f=4000,acompressor=threshold=${p.threshold}:ratio=10:attack=0.3:release=50,lowpass=f=16000`, `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function DeEsserTool() { return <GenericFilterTool config={config} />; }
