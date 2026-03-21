import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Aspect Ratio',
  description: 'Force a specific aspect ratio with padding.',
  params: [
    { id: 'ratio', label: 'Aspect Ratio', type: 'select', defaultValue: '16:9', options: [
      { label: '16:9 (Widescreen)', value: '16:9' },
      { label: '4:3 (Standard)', value: '4:3' },
      { label: '1:1 (Square)', value: '1:1' },
      { label: '9:16 (Vertical)', value: '9:16' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const ratio = p.ratio as string;
    const [rw, rh] = ratio.split(':').map(Number);
    return {
      args: ['-i', 'input', '-vf', `scale=iw:ih,setsar=1,pad=ih*${rw}/${rh}:ih:(ow-iw)/2:0:black`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function AspectRatioTool() { return <GenericFilterTool config={config} />; }
