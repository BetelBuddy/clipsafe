import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Split Screen',
  description: 'Split screen with different filters on left/right.',
  params: [
    { id: 'filter', label: 'Right Side Filter', type: 'select', defaultValue: 'hue=s=0', options: [
      { label: 'Grayscale', value: 'hue=s=0' },
      { label: 'Negative', value: 'negate' },
      { label: 'Blur', value: 'boxblur=10' },
      { label: 'Edge Detect', value: 'edgedetect' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-filter_complex', `[0:v]split[left][right];[right]${p.filter}[rf];[left][rf]hstack`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SplitScreenTool() { return <GenericFilterTool config={config} />; }
