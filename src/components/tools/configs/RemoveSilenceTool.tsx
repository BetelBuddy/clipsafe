import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Remove Silence',
  description: 'Automatically detect and remove silent segments from your video.',
  params: [
    { id: 'threshold', label: 'Silence Threshold (dB)', type: 'slider', defaultValue: -30, min: -60, max: -10, step: 1 },
    { id: 'minDuration', label: 'Min Silence Duration (s)', type: 'slider', defaultValue: 0.5, min: 0.1, max: 3, step: 0.1 },
  ],
  buildArgs: (p, ext) => {
    const threshold = p.threshold as number;
    const minDur = p.minDuration as number;
    return {
      args: ['-i', 'input.' + ext, '-af', `silenceremove=stop_periods=-1:stop_duration=${minDur}:stop_threshold=${threshold}dB`, '-y', 'output.' + ext],
      outputFileName: 'no_silence.' + ext,
    };
  },
};

export default function RemoveSilenceTool() {
  return <GenericFilterTool config={config} />;
}
