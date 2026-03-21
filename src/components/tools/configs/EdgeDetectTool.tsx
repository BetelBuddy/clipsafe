import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Edge Detect',
  description: 'Apply artistic edge detection filter.',
  params: [
    { id: 'mode', label: 'Mode', type: 'select', defaultValue: 'default', options: [
      { label: 'Standard', value: 'default' },
      { label: 'Colormix', value: 'colormix' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const filter = p.mode === 'colormix' ? 'edgedetect=mode=colormix:high=0.1' : 'edgedetect=high=0.1';
    return { args: ['-i', 'input', '-vf', filter, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function EdgeDetectTool() { return <GenericFilterTool config={config} />; }
