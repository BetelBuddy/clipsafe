import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Reframe',
  description: 'Automatically reframe for vertical and square outputs.',
  params: [{ id: 'ratio', label: 'Target Ratio', type: 'select', defaultValue: '9:16', options: [{ label: '9:16', value: '9:16' }, { label: '1:1', value: '1:1' }] }],
  buildArgs: (p, ext) => {
    const [rw, rh] = String(p.ratio).split(':').map(Number);
    return { args: ['-i', 'input', '-vf', `crop='min(iw,ih*${rw}/${rh})':'min(ih,iw*${rh}/${rw})'`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function AutoReframeTool() { return <GenericFilterTool config={config} />; }
