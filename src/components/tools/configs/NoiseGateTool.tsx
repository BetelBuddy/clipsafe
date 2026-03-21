import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Noise Gate',
  description: 'Gate audio below a volume threshold.',
  params: [
    { id: 'threshold', label: 'Threshold (dB)', type: 'slider', defaultValue: -40, min: -80, max: 0, step: 1 },
    { id: 'attack', label: 'Attack (ms)', type: 'slider', defaultValue: 20, min: 1, max: 200, step: 1 },
    { id: 'release', label: 'Release (ms)', type: 'slider', defaultValue: 200, min: 10, max: 2000, step: 10 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `agate=threshold=${p.threshold}dB:attack=${p.attack}:release=${p.release}`, '-c:v', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function NoiseGateTool() { return <GenericFilterTool config={config} />; }
