import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Denoise',
  description: 'Reduce video noise using hqdn3d filter.',
  params: [
    { id: 'strength', label: 'Strength', type: 'select', defaultValue: 'medium', options: [
      { label: 'Light', value: 'light' },
      { label: 'Medium', value: 'medium' },
      { label: 'Heavy', value: 'heavy' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const map: Record<string, string> = { light: 'hqdn3d=2:2:4:4', medium: 'hqdn3d=4:3:6:4.5', heavy: 'hqdn3d=8:6:12:9' };
    return { args: ['-i', 'input', '-vf', map[p.strength as string] || map.medium, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function DenoiseTool() { return <GenericFilterTool config={config} />; }
