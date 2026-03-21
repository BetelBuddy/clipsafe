import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Compressor',
  description: 'Dynamic range compression for more consistent audio levels.',
  params: [
    { id: 'threshold', label: 'Threshold (dB)', type: 'slider', defaultValue: -20, min: -60, max: 0, step: 1 },
    { id: 'ratio', label: 'Ratio', type: 'slider', defaultValue: 4, min: 1, max: 20, step: 1 },
    { id: 'attack', label: 'Attack (ms)', type: 'slider', defaultValue: 20, min: 1, max: 200, step: 1 },
    { id: 'release', label: 'Release (ms)', type: 'slider', defaultValue: 250, min: 10, max: 2000, step: 10 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `acompressor=threshold=${(p.threshold as number) / 100}:ratio=${p.ratio}:attack=${p.attack}:release=${p.release}`, `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CompressorTool() { return <GenericFilterTool config={config} />; }
