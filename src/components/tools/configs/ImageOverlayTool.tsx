import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Image Overlay',
  description: 'Overlay an image (watermark/logo) at a specified position on your video.',
  params: [
    { id: 'x', label: 'X Position', type: 'number', defaultValue: 10, min: 0, max: 3840, placeholder: '10' },
    { id: 'y', label: 'Y Position', type: 'number', defaultValue: 10, min: 0, max: 2160, placeholder: '10' },
    { id: 'opacity', label: 'Opacity', type: 'slider', defaultValue: 1, min: 0.1, max: 1, step: 0.05 },
    { id: 'scale', label: 'Scale', type: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1 },
  ],
  buildArgs: (p, ext) => {
    const x = p.x as number;
    const y = p.y as number;
    const opacity = p.opacity as number;
    const scale = p.scale as number;
    // Note: requires second input file - this generates the overlay command
    return {
      args: ['-i', 'input.' + ext, '-filter_complex', `[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${opacity}[ovrl];[0:v][ovrl]overlay=${x}:${y}`, '-y', 'output.' + ext],
      outputFileName: 'with_overlay.' + ext,
    };
  },
};

export default function ImageOverlayTool() {
  return <GenericFilterTool config={config} />;
}
