import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Blur Background',
  description: 'Add blurred padded background for vertical-to-landscape conversion.',
  params: [
    { id: 'width', label: 'Output Width', type: 'number', defaultValue: 1920, min: 100, step: 1, placeholder: '1920' },
    { id: 'height', label: 'Output Height', type: 'number', defaultValue: 1080, min: 100, step: 1, placeholder: '1080' },
    { id: 'blur', label: 'Background Blur', type: 'slider', defaultValue: 40, min: 5, max: 100, step: 5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-filter_complex', `[0:v]scale=${p.width}:${p.height},boxblur=${p.blur}[bg];[0:v]scale=${p.width}:${p.height}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function BlurBackgroundTool() { return <GenericFilterTool config={config} />; }
