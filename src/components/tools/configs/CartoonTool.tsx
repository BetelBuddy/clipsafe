import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Cartoon / Cel Shade',
  description: 'Edge detect + posterize for a cartoon look.',
  params: [
    { id: 'colors', label: 'Color Levels', type: 'slider', defaultValue: 8, min: 2, max: 16, step: 1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `edgedetect=mode=colormix:high=0.1,eq=contrast=10,posterize=${p.colors}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CartoonTool() { return <GenericFilterTool config={config} />; }
