import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Background Remove',
  description: 'Chroma-key style background removal.',
  params: [{ id: 'color', label: 'Key Color', type: 'text', defaultValue: '0x00ff00', placeholder: '0x00ff00' }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `chromakey=${p.color}:0.18:0.08`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function BackgroundRemoveTool() { return <GenericFilterTool config={config} />; }
