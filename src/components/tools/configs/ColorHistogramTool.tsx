import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Color Histogram',
  description: 'Generate a color histogram overlay on the video.',
  params: [
    { id: 'mode', label: 'Display Mode', type: 'select', defaultValue: 'levels', options: [
      { label: 'Levels', value: 'levels' },
      { label: 'Waveform', value: 'color' },
      { label: 'Parade', value: 'parade' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `split[main][hist];[hist]histogram=display_mode=${p.mode},scale=320:200[hv];[main][hv]overlay=W-w-10:H-h-10`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ColorHistogramTool() { return <GenericFilterTool config={config} />; }
