import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Stack Vertical',
  description: 'Stack two videos vertically (top and bottom).',
  params: [
    { id: 'width', label: 'Output Width (px)', type: 'number', defaultValue: 1280, min: 320, max: 3840, placeholder: '1280' },
  ],
  buildArgs: (p, ext) => {
    const width = p.width as number;
    return {
      args: ['-i', 'input.' + ext, '-filter_complex', `[0:v]scale=${width}:-2[top];[0:v]scale=${width}:-2[bottom];[top][bottom]vstack=inputs=2`, '-y', 'output.' + ext],
      outputFileName: 'stacked_vertical.' + ext,
    };
  },
};

export default function StackVerticalTool() {
  return <GenericFilterTool config={config} />;
}
