import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Silence Detect',
  description: 'Mark silent intervals with a visual indicator overlay.',
  params: [
    { id: 'threshold', label: 'Noise Threshold (dB)', type: 'slider', defaultValue: -30, min: -60, max: -10, step: 1 },
    { id: 'duration', label: 'Min Silence Duration (s)', type: 'slider', defaultValue: 0.5, min: 0.1, max: 5, step: 0.1 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-af', `silencedetect=noise=${p.threshold}dB:d=${p.duration}`, '-c:v', 'copy', '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function SilenceDetectTool() { return <GenericFilterTool config={config} />; }
