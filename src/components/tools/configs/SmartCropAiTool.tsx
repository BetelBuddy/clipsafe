import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Smart Crop AI',
  description: 'Smart-style center crop for primary subject framing.',
  params: [{ id: 'ratio', label: 'Ratio', type: 'select', defaultValue: '1:1', options: [{ label: '1:1', value: '1:1' }, { label: '9:16', value: '9:16' }, { label: '16:9', value: '16:9' }] }],
  buildArgs: (p, ext) => {
    const [rw, rh] = String(p.ratio).split(':').map(Number);
    return { args: ['-i', 'input', '-vf', `crop='min(iw,ih*${rw}/${rh})':'min(ih,iw*${rh}/${rw})'`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function SmartCropAiTool() { return <GenericFilterTool config={config} />; }
