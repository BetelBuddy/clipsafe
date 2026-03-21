import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Mirror',
  description: 'Create a mirror reflection effect.',
  params: [
    { id: 'direction', label: 'Direction', type: 'select', defaultValue: 'horizontal', options: [
      { label: 'Horizontal (left-right)', value: 'horizontal' },
      { label: 'Vertical (top-bottom)', value: 'vertical' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const filter = p.direction === 'horizontal'
      ? 'crop=iw/2:ih:0:0,split[l][r];[r]hflip[rf];[l][rf]hstack'
      : 'crop=iw:ih/2:0:0,split[t][b];[b]vflip[bf];[t][bf]vstack';
    return { args: ['-i', 'input', '-filter_complex', filter, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function MirrorTool() { return <GenericFilterTool config={config} />; }
