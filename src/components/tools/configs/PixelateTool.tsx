import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Pixelate',
  description: 'Apply a pixelation/mosaic effect.',
  params: [
    { id: 'size', label: 'Pixel Size', type: 'slider', defaultValue: 10, min: 2, max: 50, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const s = p.size as number;
    return {
      args: ['-i', 'input', '-vf', `scale=iw/${s}:ih/${s}:flags=neighbor,scale=iw*${s}:ih*${s}:flags=neighbor`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function PixelateTool() { return <GenericFilterTool config={config} />; }
