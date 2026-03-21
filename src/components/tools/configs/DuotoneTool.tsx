import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Duotone',
  description: 'Map shadows and highlights to two colors for a striking duotone effect.',
  params: [
    { id: 'shadow', label: 'Shadow Color', type: 'select', defaultValue: 'blue', options: [
      { label: 'Blue', value: 'blue' }, { label: 'Purple', value: 'purple' },
      { label: 'Teal', value: 'teal' }, { label: 'Red', value: 'red' },
    ]},
    { id: 'highlight', label: 'Highlight Color', type: 'select', defaultValue: 'orange', options: [
      { label: 'Orange', value: 'orange' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Pink', value: 'pink' }, { label: 'Cyan', value: 'cyan' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const colorMap: Record<string, string> = {
      blue: '0:0:1', purple: '0.5:0:1', teal: '0:0.5:0.5', red: '1:0:0',
      orange: '1:0.5:0', yellow: '1:1:0', pink: '1:0.4:0.7', cyan: '0:1:1',
    };
    const s = colorMap[p.shadow as string] || '0:0:1';
    const h = colorMap[p.highlight as string] || '1:0.5:0';
    const [sr, sg, sb] = s.split(':');
    const [hr, hg, hb] = h.split(':');
    return {
      args: ['-i', 'input', '-vf', `format=gray,colorbalance=rs=${sr}:gs=${sg}:bs=${sb}:rh=${hr}:gh=${hg}:bh=${hb}`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function DuotoneTool() { return <GenericFilterTool config={config} />; }
