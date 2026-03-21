import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Curves',
  description: 'Apply a tone curve preset.',
  params: [
    { id: 'preset', label: 'Preset', type: 'select', defaultValue: 'increase_contrast', options: [
      { label: 'Increase Contrast', value: 'increase_contrast' },
      { label: 'Brighter', value: 'lighter' },
      { label: 'Darker', value: 'darker' },
      { label: 'Vintage', value: 'vintage' },
      { label: 'Cross Process', value: 'cross_process' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `curves=preset=${p.preset}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CurvesTool() { return <GenericFilterTool config={config} />; }
