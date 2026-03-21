import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Hum Remove',
  description: 'Remove low-frequency electrical hum.',
  params: [{ id: 'freq', label: 'Hum Frequency', type: 'select', defaultValue: '50', options: [{ label: '50 Hz', value: '50' }, { label: '60 Hz', value: '60' }] }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-af', `highpass=f=${Number(p.freq) + 20}`, '-c:v', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AudioHumRemoveTool() { return <GenericFilterTool config={config} />; }
