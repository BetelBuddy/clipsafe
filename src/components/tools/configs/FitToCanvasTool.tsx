import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Fit to Canvas',
  description: 'Scale and pad to exact dimensions, preserving aspect ratio.',
  params: [
    { id: 'width', label: 'Canvas Width', type: 'number', defaultValue: 1920, min: 100, step: 1, placeholder: '1920' },
    { id: 'height', label: 'Canvas Height', type: 'number', defaultValue: 1080, min: 100, step: 1, placeholder: '1080' },
    { id: 'color', label: 'Pad Color', type: 'text', defaultValue: 'black', placeholder: 'black' },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `scale=${p.width}:${p.height}:force_original_aspect_ratio=decrease,pad=${p.width}:${p.height}:(ow-iw)/2:(oh-ih)/2:color=${p.color}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function FitToCanvasTool() { return <GenericFilterTool config={config} />; }
