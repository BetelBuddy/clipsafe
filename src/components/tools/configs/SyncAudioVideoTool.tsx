import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Sync Audio Video',
  description: 'Shift audio to re-sync with video.',
  params: [{ id: 'delay', label: 'Delay (ms)', type: 'number', defaultValue: 120, min: -5000, max: 5000, step: 10 }],
  buildArgs: (p, ext) => {
    const d = Number(p.delay);
    return d >= 0
      ? { args: ['-i', 'input', '-af', `adelay=${d}|${d}`, '-c:v', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }
      : { args: ['-i', 'input', '-af', `atrim=start=${Math.abs(d) / 1000},asetpts=PTS-STARTPTS`, '-c:v', 'copy', `output.${ext}`], outputFileName: `output.${ext}` };
  },
};

export default function SyncAudioVideoTool() { return <GenericFilterTool config={config} />; }
