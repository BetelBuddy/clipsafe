import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Loudness Normalize (LUFS)',
  description: 'Normalize audio to broadcast-standard LUFS levels.',
  params: [
    { id: 'target', label: 'Target LUFS', type: 'select', defaultValue: '-14', options: [
      { label: '-14 LUFS (Streaming)', value: '-14' },
      { label: '-16 LUFS (Podcast)', value: '-16' },
      { label: '-23 LUFS (Broadcast)', value: '-23' },
      { label: '-11 LUFS (Loud)', value: '-11' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `loudnorm=I=${p.target}:TP=-1.5:LRA=11`, `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function LoudnormTool() { return <GenericFilterTool config={config} />; }
