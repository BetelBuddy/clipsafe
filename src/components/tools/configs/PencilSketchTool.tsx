import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Pencil Sketch',
  description: 'Convert video to pencil sketch line drawing look.',
  params: [
    { id: 'detail', label: 'Detail', type: 'select', defaultValue: 'medium', options: [
      { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const thresholds: Record<string, string> = { low: '0.3', medium: '0.1', high: '0.05' };
    const t = thresholds[p.detail as string] || '0.1';
    return {
      args: ['-i', 'input', '-vf', `edgedetect=low=${t}:high=${parseFloat(t) * 3},negate,format=gray`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function PencilSketchTool() { return <GenericFilterTool config={config} />; }
