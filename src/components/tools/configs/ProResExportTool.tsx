import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'ProRes Export',
  description: 'Export as ProRes for professional editing workflows.',
  params: [
    { id: 'profile', label: 'ProRes Profile', type: 'select', defaultValue: '2', options: [
      { label: 'Proxy', value: '0' },
      { label: 'LT', value: '1' },
      { label: 'Standard', value: '2' },
      { label: 'HQ', value: '3' },
    ]},
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-c:v', 'prores_ks', '-profile:v', String(p.profile), '-c:a', 'pcm_s16le', 'output.mov'],
    outputFileName: 'output.mov',
  }),
};

export default function ProResExportTool() { return <GenericFilterTool config={config} />; }
