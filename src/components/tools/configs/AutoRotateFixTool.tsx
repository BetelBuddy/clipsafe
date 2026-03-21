import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Rotate Fix',
  description: 'Auto-fix orientation metadata issues.',
  params: [{ id: 'mode', label: 'Mode', type: 'select', defaultValue: 'clock', options: [{ label: 'Clockwise', value: 'clock' }, { label: 'Counter-clockwise', value: 'cclock' }] }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', p.mode === 'clock' ? 'transpose=1' : 'transpose=2', '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function AutoRotateFixTool() { return <GenericFilterTool config={config} />; }
