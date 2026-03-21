import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Sync / Delay',
  description: 'Shift audio forward or backward to fix sync issues.',
  params: [
    { id: 'delay', label: 'Delay (ms)', type: 'number', defaultValue: 200, min: -5000, max: 5000, step: 10, placeholder: 'e.g. 200 or -100' },
  ],
  buildArgs: (p, ext) => {
    const d = p.delay as number;
    if (d >= 0) {
      return {
        args: ['-i', 'input', '-af', `adelay=${d}|${d}`, `output.${ext}`],
        outputFileName: `output.${ext}`,
      };
    }
    // Negative delay: trim audio start
    const sec = Math.abs(d) / 1000;
    return {
      args: ['-i', 'input', '-af', `atrim=start=${sec.toFixed(3)},asetpts=PTS-STARTPTS`, `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function AudioDelayTool() { return <GenericFilterTool config={config} />; }
