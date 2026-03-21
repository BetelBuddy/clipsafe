import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Face Track Zoom',
  description: 'Dynamic zoom effect to simulate face tracking.',
  params: [{ id: 'zoom', label: 'Zoom', type: 'slider', defaultValue: 1.2, min: 1.05, max: 2, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `scale=iw*${p.zoom}:ih*${p.zoom},crop=iw/${p.zoom}:ih/${p.zoom}`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function FaceTrackZoomTool() { return <GenericFilterTool config={config} />; }
