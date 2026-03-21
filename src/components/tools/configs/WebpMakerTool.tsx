import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'WebP Maker',
  description: 'Convert video clips to animated WebP format with custom quality and size.',
  params: [
    { id: 'fps', label: 'Frames Per Second', type: 'slider', defaultValue: 15, min: 5, max: 30, step: 1 },
    { id: 'width', label: 'Width (px)', type: 'number', defaultValue: 480, min: 100, max: 1920, placeholder: '480' },
    { id: 'quality', label: 'Quality', type: 'slider', defaultValue: 75, min: 10, max: 100, step: 5 },
    { id: 'loop', label: 'Loop', type: 'toggle', defaultValue: true },
  ],
  buildArgs: (p) => {
    const fps = p.fps as number;
    const width = p.width as number;
    const quality = p.quality as number;
    const loop = p.loop as boolean;
    return {
      args: ['-i', 'input.mp4', '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`, '-vcodec', 'libwebp', '-quality', `${quality}`, '-loop', loop ? '0' : '1', '-y', 'output.webp'],
      outputFileName: 'animated.webp',
    };
  },
};

export default function WebpMakerTool() {
  return <GenericFilterTool config={config} />;
}
