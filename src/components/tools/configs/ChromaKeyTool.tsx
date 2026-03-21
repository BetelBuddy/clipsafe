import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Chroma Key',
  description: 'Remove green/blue screen background from video.',
  params: [
    { id: 'color', label: 'Key Color', type: 'select', defaultValue: '0x00FF00', options: [
      { label: 'Green', value: '0x00FF00' }, { label: 'Blue', value: '0x0000FF' },
      { label: 'Red', value: 'red' }, { label: 'White', value: 'white' },
    ]},
    { id: 'similarity', label: 'Similarity', type: 'slider', defaultValue: 0.3, min: 0.01, max: 1, step: 0.01 },
    { id: 'blend', label: 'Blend', type: 'slider', defaultValue: 0.1, min: 0, max: 1, step: 0.01 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `chromakey=color=${p.color}:similarity=${p.similarity}:blend=${p.blend}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function ChromaKeyTool() { return <GenericFilterTool config={config} />; }
