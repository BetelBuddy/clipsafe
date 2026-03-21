import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Scene Detect & Split',
  description: 'Detect scene changes and split video at scene boundaries using threshold-based detection.',
  params: [
    { id: 'threshold', label: 'Scene Change Threshold', type: 'slider', defaultValue: 0.3, min: 0.1, max: 0.9, step: 0.05 },
  ],
  buildArgs: (p, ext) => {
    const threshold = p.threshold as number;
    return {
      args: ['-i', 'input.' + ext, '-filter:v', `select='gt(scene,${threshold})',setpts=N/FRAME_RATE/TB`, '-af', `aselect='gt(scene,${threshold})',asetpts=N/SR/TB`, '-y', 'output.' + ext],
      outputFileName: 'scene_split.' + ext,
    };
  },
};

export default function SceneDetectTool() {
  return <GenericFilterTool config={config} />;
}
