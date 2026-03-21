import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Side by Side',
  description: 'Stack the same video side by side (horizontal compare).',
  params: [
    { id: 'direction', label: 'Direction', type: 'select', defaultValue: 'horizontal', options: [
      { label: 'Horizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const stack = p.direction === 'horizontal' ? 'hstack' : 'vstack';
    return {
      args: ['-i', 'input', '-i', 'input', '-filter_complex', `[0:v][1:v]${stack}=inputs=2`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function SideBySideTool() { return <GenericFilterTool config={config} />; }
